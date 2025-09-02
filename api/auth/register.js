import { getDatabase } from "../../lib/mongodb"
import { generateToken, hashPassword } from "../../lib/auth"
import { validateRequest, handleApiError, corsHeaders, checkRateLimit } from "../../lib/middleware"

export default async function handler(req, res) {
  // Handle CORS preflight
  if (corsHeaders(req, res)) return

  // Rate limiting
  const rateLimitResult = await checkRateLimit(req, req.headers["x-forwarded-for"] || "anonymous", 5, 15 * 60 * 1000)
  if (!rateLimitResult.allowed) {
    return res.status(429).json({
      success: false,
      message: "Too many registration attempts. Please try again later.",
      resetTime: rateLimitResult.resetTime,
    })
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" })
  }

  const validationError = validateRequest(req, res, ["name", "email", "password"])
  if (validationError) return validationError

  try {
    const { name, email, password } = req.body

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      })
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      })
    }

    const db = await getDatabase()
    const users = db.collection("users")

    // Check if user already exists
    const existingUser = await users.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      })
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password)
    const result = await users.insertOne({
      name,
      email,
      password: hashedPassword,
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const user = await users.findOne({ _id: result.insertedId })

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      },
    })
  } catch (error) {
    return handleApiError(error, res, "User registration")
  }
}
