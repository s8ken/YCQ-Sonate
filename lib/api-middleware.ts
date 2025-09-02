import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import jwt from "jsonwebtoken"
import { connectToDatabase } from "./mongodb"
import { ObjectId } from "mongodb"

export interface ApiContext {
  user?: {
    id: string
    email: string
    role: string
    scopes?: string[]
  }
  db?: any
  requestId: string
}

// Rate limiting store (Redis would be better for production)
const rateLimitStore = new Map<string, number[]>()

// Security headers for all API responses
const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "X-Robots-Tag": "noindex, nofollow",
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
} as const

// Standard API response format
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  details?: any
  requestId?: string
  timestamp?: string
}

// Rate limiting configuration
interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  skipSuccessfulRequests?: boolean
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 10 }, // 10 attempts per 15 minutes
  trust: { windowMs: 60 * 60 * 1000, maxRequests: 20 }, // 20 declarations per hour
  agents: { windowMs: 15 * 60 * 1000, maxRequests: 50 }, // 50 requests per 15 minutes
  default: { windowMs: 15 * 60 * 1000, maxRequests: 100 }, // 100 requests per 15 minutes
}

// Input sanitization
function sanitizeInput(obj: any): any {
  if (typeof obj !== "object" || obj === null) return obj

  const sanitized: any = Array.isArray(obj) ? [] : {}

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      // Remove potential injection patterns
      sanitized[key] = value
        .replace(/\$\w+/g, "_") // MongoDB injection
        .replace(/\.\./g, "_") // Path traversal
        .replace(/<script[^>]*>.*?<\/script>/gi, "") // XSS
        .trim()
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeInput(value)
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}

// Suspicious activity detection
function detectSuspiciousActivity(req: NextRequest): boolean {
  const suspiciousPatterns = [
    /\b(union|select|insert|delete|drop|create|alter)\b/i, // SQL injection
    /<script[^>]*>.*?<\/script>/gi, // XSS
    /javascript:/gi, // JavaScript protocol
    /\$\{.*\}/g, // Template injection
    /\.\.\//g, // Path traversal
    /eval\s*\(/gi, // Code injection
    /document\.(cookie|domain)/gi, // Cookie manipulation
  ]

  const url = req.url
  const headers = JSON.stringify(Object.fromEntries(req.headers.entries()))

  const checkString = url + headers

  return suspiciousPatterns.some((pattern) => pattern.test(checkString))
}

// Rate limiting implementation
function checkRateLimit(identifier: string, config: RateLimitConfig): boolean {
  const now = Date.now()
  const windowStart = now - config.windowMs

  // Clean old entries
  const requests = rateLimitStore.get(identifier) || []
  const recentRequests = requests.filter((time) => time > windowStart)

  if (recentRequests.length >= config.maxRequests) {
    return false // Rate limit exceeded
  }

  // Add current request
  recentRequests.push(now)
  rateLimitStore.set(identifier, recentRequests)
  return true
}

// JWT token verification
async function verifyAuthToken(req: NextRequest): Promise<ApiContext["user"] | null> {
  const authHeader = req.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return null
  }

  try {
    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any

    const db = await connectToDatabase()
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(decoded.id) }, { projection: { password: 0 } })

    if (!user) return null

    return {
      id: user._id.toString(),
      email: user.email,
      role: user.role || "user",
      scopes: user.scopes || [],
    }
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}

// Create standardized error response
function createErrorResponse(
  status: number,
  error: string,
  message: string,
  details?: any,
  requestId?: string,
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      message,
      details,
      requestId,
      timestamp: new Date().toISOString(),
    },
    { status },
  )
}

// Create standardized success response
function createSuccessResponse<T>(
  data: T,
  message?: string,
  requestId?: string,
  status = 200,
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      requestId,
      timestamp: new Date().toISOString(),
    },
    { status },
  )
}

// Main API middleware wrapper
export interface ApiMiddlewareOptions {
  auth?: "required" | "optional" | "none"
  roles?: string[]
  scopes?: string[]
  rateLimit?: keyof typeof RATE_LIMITS | RateLimitConfig
  validation?: {
    body?: z.ZodSchema
    query?: z.ZodSchema
    params?: z.ZodSchema
  }
  methods?: string[]
}

export function withApiMiddleware(
  handler: (req: NextRequest, context: ApiContext) => Promise<NextResponse>,
  options: ApiMiddlewareOptions = {},
) {
  return async (req: NextRequest, routeParams?: any): Promise<NextResponse> => {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const startTime = Date.now()

    try {
      // Apply security headers
      const response = new NextResponse()
      Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
        response.headers.set(key, value)
      })

      // Method validation
      if (options.methods && !options.methods.includes(req.method)) {
        return createErrorResponse(
          405,
          "Method Not Allowed",
          `Method ${req.method} is not allowed for this endpoint`,
          { allowedMethods: options.methods },
          requestId,
        )
      }

      // Suspicious activity detection
      if (detectSuspiciousActivity(req)) {
        console.warn(`Suspicious activity detected:`, {
          requestId,
          method: req.method,
          url: req.url,
          ip: req.headers.get("x-forwarded-for") || "unknown",
          userAgent: req.headers.get("user-agent"),
        })

        return createErrorResponse(
          400,
          "Invalid Input",
          "Request contains potentially malicious content",
          undefined,
          requestId,
        )
      }

      // Rate limiting
      const rateLimitConfig =
        typeof options.rateLimit === "string"
          ? RATE_LIMITS[options.rateLimit]
          : options.rateLimit || RATE_LIMITS.default

      const identifier = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"

      if (!checkRateLimit(identifier, rateLimitConfig)) {
        return createErrorResponse(
          429,
          "Rate Limit Exceeded",
          "Too many requests, please try again later",
          {
            retryAfter: Math.ceil(rateLimitConfig.windowMs / 1000),
            limit: rateLimitConfig.maxRequests,
            window: rateLimitConfig.windowMs,
          },
          requestId,
        )
      }

      // Authentication
      let user: ApiContext["user"] | undefined
      if (options.auth !== "none") {
        user = await verifyAuthToken(req)

        if (options.auth === "required" && !user) {
          return createErrorResponse(
            401,
            "Authentication Required",
            "Please provide a valid authentication token",
            undefined,
            requestId,
          )
        }
      }

      // Role-based access control
      if (options.roles && user) {
        const userRoles = [user.role, ...(user.scopes || [])]
        const hasRequiredRole = options.roles.some((role) => userRoles.includes(role) || userRoles.includes("admin"))

        if (!hasRequiredRole) {
          return createErrorResponse(
            403,
            "Insufficient Permissions",
            `Access denied. Required roles: ${options.roles.join(", ")}`,
            { userRoles, requiredRoles: options.roles },
            requestId,
          )
        }
      }

      // Input validation
      let body: any, query: any, params: any

      if (options.validation) {
        try {
          // Parse and validate request body
          if (options.validation.body && ["POST", "PUT", "PATCH"].includes(req.method)) {
            const rawBody = await req.json()
            body = options.validation.body.parse(sanitizeInput(rawBody))
          }

          // Validate query parameters
          if (options.validation.query) {
            const url = new URL(req.url)
            const queryObj = Object.fromEntries(url.searchParams.entries())
            query = options.validation.query.parse(sanitizeInput(queryObj))
          }

          // Validate route parameters
          if (options.validation.params && routeParams) {
            params = options.validation.params.parse(routeParams)
          }
        } catch (error) {
          if (error instanceof z.ZodError) {
            return createErrorResponse(
              400,
              "Validation Failed",
              "The request contains invalid data",
              error.errors.map((err) => ({
                field: err.path.join("."),
                message: err.message,
                code: err.code,
              })),
              requestId,
            )
          }
          throw error
        }
      }

      // Database connection
      const db = await connectToDatabase()

      // Create context
      const context: ApiContext = {
        user,
        db,
        requestId,
      }

      // Log request
      console.log(
        JSON.stringify({
          type: "api_request",
          requestId,
          method: req.method,
          url: req.url,
          userId: user?.id,
          ip: identifier,
          timestamp: new Date().toISOString(),
        }),
      )

      // Call handler with validated data
      const modifiedReq = new NextRequest(req.url, {
        method: req.method,
        headers: req.headers,
        body: body ? JSON.stringify(body) : undefined,
      })

      // Add parsed data to request
      if (body) (modifiedReq as any).validatedBody = body
      if (query) (modifiedReq as any).validatedQuery = query
      if (params) (modifiedReq as any).validatedParams = params

      const result = await handler(modifiedReq, context)

      // Log response
      const duration = Date.now() - startTime
      console.log(
        JSON.stringify({
          type: "api_response",
          requestId,
          statusCode: result.status,
          duration,
          timestamp: new Date().toISOString(),
        }),
      )

      // Add security headers to response
      Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
        result.headers.set(key, value)
      })

      return result
    } catch (error) {
      const duration = Date.now() - startTime
      console.error("API middleware error:", {
        requestId,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        duration,
      })

      return createErrorResponse(
        500,
        "Internal Server Error",
        "An unexpected error occurred",
        process.env.NODE_ENV === "development"
          ? {
              error: error instanceof Error ? error.message : "Unknown error",
              stack: error instanceof Error ? error.stack : undefined,
            }
          : undefined,
        requestId,
      )
    }
  }
}

// Utility functions for handlers
export { createErrorResponse, createSuccessResponse }

// Common validation schemas
export const commonSchemas = {
  mongoId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"),
  pagination: z.object({
    page: z.coerce.number().int().min(1).max(1000).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    sort: z.string().optional(),
    order: z.enum(["asc", "desc"]).default("desc"),
  }),
  email: z.string().email().toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain uppercase, lowercase, number, and special character",
    ),
}
