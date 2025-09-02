const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const dotenv = require("dotenv")
const mongoose = require("mongoose")
const path = require("path")
const http = require("http")
const socketIo = require("socket.io")
const { setSocketIO } = require("./utils/socket")
const {
  securityHeaders,
  sanitizeInput,
  compression,
  authRateLimit,
  apiRateLimit,
  requestLogger,
  detectSuspiciousActivity,
  validateContentType,
  requestSizeLimiter,
} = require("./middleware/security.middleware")
const app = require("./app")

// Load environment variables
dotenv.config()

// Initialize Express app (app is already imported from './app')
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
})

// Initialize socket utility
setSocketIO(io)

// Security Middleware (applied first)
app.use(securityHeaders)
app.use(compression)
app.use(requestSizeLimiter("10mb"))
app.use(validateContentType(["application/json", "application/x-www-form-urlencoded", "multipart/form-data"]))

// CORS Configuration
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.CORS_ORIGIN || "http://localhost:3000",
      "http://localhost:3000",
      "http://localhost:3001",
      "https://symbi-trust-protocol.vercel.app",
      "https://symbi-synergy-hl88yxu91-symbi.vercel.app",
    ]

    // Allow all Vercel deployment URLs for this project
    const isVercelDomain = origin && origin.includes("symbi-synergy") && origin.includes("vercel.app")
    const isSymbiDomain = origin && origin.includes("symbi") && origin.includes("vercel.app")

    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true)

    if (
      allowedOrigins.indexOf(origin) !== -1 ||
      process.env.NODE_ENV === "development" ||
      isVercelDomain ||
      isSymbiDomain
    ) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
  maxAge: 86400, // 24 hours
}

app.use(cors(corsOptions))

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Input sanitization
app.use(sanitizeInput)

// Suspicious activity detection
app.use(detectSuspiciousActivity)

// Request logging
app.use(requestLogger)

// HTTP request logging
app.use(
  morgan("combined", {
    skip: (req, res) => res.statusCode < 400,
  }),
)

// General API rate limiting
app.use("/api/", apiRateLimit)

// Root endpoint for API status
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SYMBI Trust Protocol API is running",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      conversations: "/api/conversations",
      llm: "/api/llm",
      agents: "/api/agents",
      reports: "/api/reports",
      context: "/api/context",
      webhooks: "/api/webhooks",
      trust: "/api/trust",
      trustProtocol: "/api/trust-protocol",
    },
    documentation: "Visit /api/trust for trust protocol endpoints",
  })
})

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  })
})

app.get("/ready", async (req, res) => {
  try {
    // Check database connection
    const dbState = mongoose.connection.readyState
    const dbStatus = dbState === 1 ? "connected" : "disconnected"

    // Check Socket.io status
    const socketStatus = io ? "initialized" : "not initialized"

    if (dbState !== 1) {
      return res.status(503).json({
        success: false,
        status: "not ready",
        checks: {
          database: dbStatus,
          socket: socketStatus,
        },
        timestamp: new Date().toISOString(),
      })
    }

    res.status(200).json({
      success: true,
      status: "ready",
      checks: {
        database: dbStatus,
        socket: socketStatus,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    res.status(503).json({
      success: false,
      status: "not ready",
      error: error.message,
      timestamp: new Date().toISOString(),
    })
  }
})

app.get("/healthz", (req, res) => res.redirect("/health"))
app.get("/readyz", (req, res) => res.redirect("/ready"))

// Database connection
// Configure mongoose to handle buffering timeouts
mongoose.set("bufferCommands", false)

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/symbi-synergy", {
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    maxPoolSize: 10, // Maintain up to 10 socket connections
    minPoolSize: 5, // Maintain a minimum of 5 socket connections
    maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
    family: 4, // Use IPv4, skip trying IPv6
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Import routes
const authRoutes = require("./routes/auth.routes")
const userRoutes = require("./routes/user.routes")
const conversationRoutes = require("./routes/conversation.routes")
const llmRoutes = require("./routes/llm.routes")
const agentRoutes = require("./routes/agent.routes")
const reportRoutes = require("./routes/reports")
const contextRoutes = require("./routes/context")
const webhookRoutes = require("./routes/webhook.routes")
const trustRoutes = require("./routes/trust.routes")
const trustProtocolRoutes = require("./routes/trust-protocol.routes")

// API routes with specific rate limiting
app.use("/api/auth", authRateLimit, authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/conversations", conversationRoutes)
app.use("/api/llm", llmRoutes)
app.use("/api/agents", agentRoutes)
app.use("/api/reports", reportRoutes)
app.use("/api/context", contextRoutes)
app.use("/api/webhooks", webhookRoutes)
app.use("/api/trust", trustRoutes)
app.use("/api/trust-protocol", trustProtocolRoutes)

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")))

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend", "build", "index.html"))
  })
}

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("New client connected")

  socket.on("joinConversation", (conversationId) => {
    socket.join(conversationId)
    console.log(`User joined conversation: ${conversationId}`)
  })

  socket.on("new_message", (data) => {
    io.to(data.conversationId).emit("message_received", data)
  })

  socket.on("ai_communication", (data) => {
    io.to(data.targetAgentId).emit("ai_message", data)
  })

  socket.on("disconnect", () => {
    console.log("Client disconnected")
  })
})

// Start server
const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
})

module.exports = { app, server, io }
