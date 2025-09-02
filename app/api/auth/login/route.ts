import type { NextRequest } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import {
  withApiMiddleware,
  createSuccessResponse,
  createErrorResponse,
  commonSchemas,
  type ApiContext,
} from "../../../../lib/api-middleware"

const loginSchema = z.object({
  email: commonSchemas.email,
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
})

async function loginHandler(req: NextRequest, context: ApiContext) {
  const { email, password, rememberMe } = (req as any).validatedBody

  try {
    // Find user with password field included
    const user = await context.db
      .collection("users")
      .findOne({ email }, { projection: { password: 1, email: 1, name: 1, role: 1, scopes: 1, isActive: 1 } })

    if (!user) {
      return createErrorResponse(401, "Invalid Credentials", "Invalid email or password", undefined, context.requestId)
    }

    // Check if user account is active
    if (user.isActive === false) {
      return createErrorResponse(
        401,
        "Account Disabled",
        "Your account has been disabled. Please contact support.",
        undefined,
        context.requestId,
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return createErrorResponse(401, "Invalid Credentials", "Invalid email or password", undefined, context.requestId)
    }

    // Generate JWT token
    const tokenExpiry = rememberMe ? "30d" : "24h"
    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: user.role || "user",
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: tokenExpiry },
    )

    // Update last login
    await context.db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: { lastLogin: new Date() },
        $inc: { loginCount: 1 },
      },
    )

    // Log successful login
    console.log(
      JSON.stringify({
        type: "user_login",
        userId: user._id.toString(),
        email: user.email,
        ip: req.headers.get("x-forwarded-for") || "unknown",
        userAgent: req.headers.get("user-agent"),
        timestamp: new Date().toISOString(),
      }),
    )

    return createSuccessResponse(
      {
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role || "user",
          scopes: user.scopes || [],
        },
        token,
        expiresIn: tokenExpiry,
      },
      "Login successful",
      context.requestId,
    )
  } catch (error) {
    console.error("Login error:", error)
    return createErrorResponse(
      500,
      "Authentication Error",
      "An error occurred during authentication",
      undefined,
      context.requestId,
    )
  }
}

export const POST = withApiMiddleware(loginHandler, {
  auth: "none",
  methods: ["POST"],
  rateLimit: "auth",
  validation: {
    body: loginSchema,
  },
})
