import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: "30d",
  })
}

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
  } catch (error) {
    throw new Error("Invalid token")
  }
}

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword)
}

export const extractToken = (req) => {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1]
  }
  return null
}
