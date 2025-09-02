const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const {
  securityHeaders,
  sanitizeInput,
  compression,
  authRateLimit,
  apiRateLimit,
  requestLogger,
  detectSuspiciousActivity,
  validateContentType,
  requestSizeLimiter
} = require('./middleware/security.middleware');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Security Middleware (applied first)
app.use(securityHeaders);
app.use(compression);
app.use(requestSizeLimiter('10mb'));
app.use(validateContentType(['application/json', 'application/x-www-form-urlencoded', 'multipart/form-data']));

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CORS_ORIGIN || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:3001',
      'https://symbi-trust-protocol.vercel.app',
      'https://symbi-synergy-hl88yxu91-symbi.vercel.app'
    ];
    
    const isVercelDomain = origin && (origin.includes('symbi-synergy') && origin.includes('vercel.app'));
    const isSymbiDomain = origin && (origin.includes('symbi') && origin.includes('vercel.app'));
    
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development' || isVercelDomain || isSymbiDomain) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  maxAge: 86400
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization
app.use(sanitizeInput);

// Suspicious activity detection
app.use(detectSuspiciousActivity);

// Request logging
app.use(requestLogger);

// HTTP request logging
app.use(morgan('combined', {
  skip: (req, res) => res.statusCode < 400
}));

// General API rate limiting
app.use('/api/', apiRateLimit);

// Database connection - only connect if not in test mode
if (process.env.NODE_ENV !== 'test') {
  mongoose.set('bufferCommands', false);
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/symbi-synergy', {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 5,
    maxIdleTimeMS: 30000,
    family: 4
  })
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));
}

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const conversationRoutes = require('./routes/conversation.routes');
const llmRoutes = require('./routes/llm.routes');
const agentRoutes = require('./routes/agent.routes');
const reportRoutes = require('./routes/reports');
const contextRoutes = require('./routes/context');
const webhookRoutes = require('./routes/webhook.routes');
const trustRoutes = require('./routes/trust.routes');
const snowflakeRoutes = require('./routes/snowflake.routes');
const assistantRoutes = require('./routes/assistant.routes');

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'SYMBI Trust Protocol API is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      conversations: '/api/conversations',
      llm: '/api/llm',
      agents: '/api/agents',
      reports: '/api/reports',
      context: '/api/context',
      webhooks: '/api/webhooks',
      trust: '/api/trust'
    },
    documentation: 'Visit /api/trust for trust protocol endpoints'
  });
});

// API routes
app.use('/api/auth', authRateLimit, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/llm', llmRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/context', contextRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/trust', trustRoutes);
app.use('/api/snowflake', snowflakeRoutes);
app.use('/api/assistant', assistantRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html'));
  });
}

// CORS Error Handler
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      error: 'CORS Error',
      message: 'Origin not allowed by CORS policy'
    });
  }
  next(err);
});

// Global Error Handler
app.use((err, req, res, next) => {
  if (err.status === 401 || err.status === 403 || err.status === 429) {
    console.warn(JSON.stringify({
      type: 'security_error',
      error: err.message,
      status: err.status,
      requestId: req.requestId,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    }));
  } else {
    console.error('Server Error:', {
      message: err.message,
      stack: err.stack,
      requestId: req.requestId,
      method: req.method,
      path: req.path
    });
  }

  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    success: false,
    error: err.name || 'Server Error',
    message: err.message || 'Internal server error',
    requestId: req.requestId,
    ...(isDevelopment && { stack: err.stack })
  });
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    requestId: req.requestId
  });
});

module.exports = app;