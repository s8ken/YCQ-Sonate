import { validationResult } from "express-validator"

// Rate limiting store (in-memory for serverless)
const rateLimitStore = new Map()

// Security headers for API responses
export const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
}

// Rate limiting function for serverless
export const rateLimit = (windowMs, maxRequests, identifier) => {
  const now = Date.now()
  const windowStart = now - windowMs

  // Clean old entries
  for (const [key, requests] of rateLimitStore.entries()) {
    rateLimitStore.set(
      key,
      requests.filter((time) => time > windowStart),
    )
    if (rateLimitStore.get(key).length === 0) {
      rateLimitStore.delete(key)
    }
  }

  // Check current requests
  const requests = rateLimitStore.get(identifier) || []
  const recentRequests = requests.filter((time) => time > windowStart)

  if (recentRequests.length >= maxRequests) {
    return false // Rate limit exceeded
  }

  // Add current request
  recentRequests.push(now)
  rateLimitStore.set(identifier, recentRequests)
  return true // Request allowed
}

export const sanitizeInput = (obj) => {
  if (typeof obj !== "object" || obj === null) return obj

  const sanitized = Array.isArray(obj) ? [] : {}

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      // Remove potential MongoDB injection patterns
      sanitized[key] = value.replace(/\$\w+/g, "_").replace(/\./g, "_")
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeInput(value)
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}

export const detectSuspiciousActivity = (req) => {
  const suspiciousPatterns = [
    /\b(union|select|insert|delete|drop|create|alter)\b/i,
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /\$\{.*\}/g,
    /\.\.\//g,
  ]

  const checkString =
    JSON.stringify(req.body || {}) + JSON.stringify(req.query || {}) + JSON.stringify(req.params || {})

  return suspiciousPatterns.some((pattern) => pattern.test(checkString))
}

// Security middleware wrapper for API routes
export const withSecurity = (handler, options = {}) => {
  return async (req, res) => {
    try {
      Object.entries(securityHeaders).forEach(([key, value]) => {
        res.setHeader(key, value)
      })

      if (options.rateLimit) {
        const { windowMs = 15 * 60 * 1000, maxRequests = 100 } = options.rateLimit
        const identifier = req.headers["x-forwarded-for"] || req.connection?.remoteAddress || "unknown"

        if (!rateLimit(windowMs, maxRequests, identifier)) {
          return res.status(429).json({
            success: false,
            error: "Rate limit exceeded",
            message: "Too many requests, please try again later",
          })
        }
      }

      if (detectSuspiciousActivity(req)) {
        console.warn(`Suspicious activity detected from ${req.headers["x-forwarded-for"]}:`, {
          method: req.method,
          url: req.url,
          body: JSON.stringify(req.body).substring(0, 200),
        })

        return res.status(400).json({
          success: false,
          error: "Invalid input detected",
          message: "Request contains potentially malicious content",
        })
      }

      if (req.body) {
        req.body = sanitizeInput(req.body)
      }
      if (req.query) {
        req.query = sanitizeInput(req.query)
      }

      if (["POST", "PUT", "PATCH"].includes(req.method)) {
        const contentType = req.headers["content-type"]
        if (!contentType || !contentType.includes("application/json")) {
          return res.status(415).json({
            success: false,
            error: "Unsupported Media Type",
            message: "Content-Type must be application/json",
          })
        }
      }

      // Call the actual handler
      return await handler(req, res)
    } catch (error) {
      console.error("Security middleware error:", error)
      return res.status(500).json({
        success: false,
        error: "Internal server error",
        message: "An unexpected error occurred",
      })
    }
  }
}

// Role-based access control
export const requireRole = (roles) => {
  return (handler) => {
    return async (req, res) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
          message: "Please authenticate to access this resource",
        })
      }

      const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.role]
      const requiredRoles = Array.isArray(roles) ? roles : [roles]

      const hasRequiredRole = requiredRoles.some((role) => userRoles.includes(role) || userRoles.includes("admin"))

      if (!hasRequiredRole) {
        return res.status(403).json({
          success: false,
          error: "Insufficient permissions",
          message: `Access denied. Required roles: ${requiredRoles.join(", ")}`,
        })
      }

      return await handler(req, res)
    }
  }
}

// Validation error handler
export const handleValidationErrors = (req, res) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
    }))

    return res.status(400).json({
      success: false,
      error: "Validation failed",
      message: "The request contains invalid data",
      details: formattedErrors,
    })
  }

  return null // No errors
}
