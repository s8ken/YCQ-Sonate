import { getDatabase } from "../../lib/mongodb"
import { generateToken, comparePassword } from "../../lib/auth"
import { withSecurity, handleValidationErrors } from "../../lib/security"
import { body } from "express-validator"

const validateLogin = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 1 }).withMessage("Password is required"),
]

async function loginHandler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" })
  }

  const validationError = handleValidationErrors(req, res)
  if (validationError) return validationError

  try {
    const { email, password } = req.body

    const db = await getDatabase()
    const users = db.collection("users")

    // Find user by email
    const user = await users.findOne({ email })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password)

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    await users.updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } })

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during login",
    })
  }
}

export default withSecurity(loginHandler, {
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10, // 10 login attempts per 15 minutes
  },
})
