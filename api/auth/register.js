import { getDatabase } from "../../lib/mongodb"
import { generateToken, hashPassword } from "../../lib/auth"
import { withSecurity, handleValidationErrors } from "../../lib/security"
import { body } from "express-validator"

const validateRegistration = [
  body("name").isString().isLength({ min: 2, max: 50 }).trim().withMessage("Name must be 2-50 characters long"),
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 8, max: 128 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain at least 8 characters with uppercase, lowercase, and number"),
]

async function registerHandler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" })
  }

  const validationError = handleValidationErrors(req, res)
  if (validationError) return validationError

  try {
    const { name, email, password } = req.body

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
    console.error("Registration error:", error)
    return res.status(500).json({
      success: false,
      message: "Internal server error during registration",
    })
  }
}

export default withSecurity(registerHandler, {
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 registration attempts per 15 minutes
  },
})
