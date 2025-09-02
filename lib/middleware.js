import { getDatabase } from "./mongodb"

// Security headers middleware
export function securityHeaders(req, res, next) {
  // Set security headers
  res.setHeader("X-Content-Type-Options", "nosniff")
  res.setHeader("X-Frame-Options", "DENY")
  res.setHeader("X-XSS-Protection", "1; mode=block")
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin")
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()")

  if (next) next()
}

// Input sanitization
export function sanitizeInput(data) {
  if (typeof data === "string") {
    return data
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "")
  }

  if (typeof data === "object" && data !== null) {
    const sanitized = {}
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeInput(value)
    }
    return sanitized
  }

  return data
}

// Request validation
export function validateRequest(req, res, requiredFields = []) {
  // Apply security headers
  securityHeaders(req, res)

  // Sanitize input
  if (req.body) {
    req.body = sanitizeInput(req.body)
  }

  // Check required fields
  const missingFields = requiredFields.filter((field) => !req.body[field])
  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${missingFields.join(", ")}`,
    })
  }

  // Validate content type for POST/PUT requests
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    const contentType = req.headers["content-type"]
    if (!contentType || !contentType.includes("application/json")) {
      return res.status(400).json({
        success: false,
        message: "Content-Type must be application/json",
      })
    }
  }

  return null // No validation errors
}

// Enhanced error handling
export function handleApiError(error, res, context = "API operation") {
  console.error(`[SYMBI API Error] ${context}:`, error)

  // Log to database for monitoring
  logSuspiciousActivity(error, context).catch(console.error)

  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      details: error.message,
    })
  }

  if (error.name === "MongoError" && error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Resource already exists",
    })
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
    ...(process.env.NODE_ENV === "development" && { details: error.message }),
  })
}

// Suspicious activity logging
async function logSuspiciousActivity(error, context) {
  try {
    const db = await getDatabase()
    await db.collection("security_logs").insertOne({
      type: "error",
      context,
      error: error.message,
      stack: error.stack,
      timestamp: new Date(),
      severity: error.name === "ValidationError" ? "low" : "high",
    })
  } catch (logError) {
    console.error("Failed to log suspicious activity:", logError)
  }
}

// CORS configuration for Vercel
export function corsHeaders(req, res) {
  const allowedOrigins = [
    process.env.CORS_ORIGIN || "http://localhost:3000",
    "http://localhost:3000",
    "http://localhost:3001",
    "https://symbi-trust-protocol.vercel.app",
  ]

  const origin = req.headers.origin
  const isVercelDomain = origin && origin.includes("symbi") && origin.includes("vercel.app")

  if (allowedOrigins.includes(origin) || process.env.NODE_ENV === "development" || isVercelDomain) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*")
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
  res.setHeader("Access-Control-Allow-Credentials", "true")
  res.setHeader("Access-Control-Max-Age", "86400")

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end()
    return true
  }

  return false
}

// Rate limiting for Vercel (using database-based approach)
export async function checkRateLimit(req, identifier, maxRequests = 100, windowMs = 15 * 60 * 1000) {
  try {
    const db = await getDatabase()
    const rateLimits = db.collection("rate_limits")

    const now = new Date()
    const windowStart = new Date(now.getTime() - windowMs)

    // Clean old entries
    await rateLimits.deleteMany({
      identifier,
      timestamp: { $lt: windowStart },
    })

    // Count current requests
    const requestCount = await rateLimits.countDocuments({
      identifier,
      timestamp: { $gte: windowStart },
    })

    if (requestCount >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: new Date(windowStart.getTime() + windowMs),
      }
    }

    // Log this request
    await rateLimits.insertOne({
      identifier,
      timestamp: now,
      ip: req.headers["x-forwarded-for"] || req.connection?.remoteAddress,
    })

    return {
      allowed: true,
      remaining: maxRequests - requestCount - 1,
      resetTime: new Date(windowStart.getTime() + windowMs),
    }
  } catch (error) {
    console.error("Rate limit check failed:", error)
    return { allowed: true, remaining: 100, resetTime: new Date() } // Fail open
  }
}
