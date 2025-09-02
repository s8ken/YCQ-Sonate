import clientPromise from "../../lib/mongodb"
import { verifyToken, extractToken } from "../../lib/auth"
import crypto from "crypto"
import jwt from "jsonwebtoken"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" })
  }

  try {
    // Authenticate user
    const token = extractToken(req)
    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" })
    }

    const decoded = verifyToken(token)
    const client = await clientPromise
    const db = client.db("symbi-synergy")
    const users = db.collection("users")

    const user = await users.findOne({ _id: decoded.id })
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" })
    }

    const { data, algorithm = "RS256" } = req.body

    if (!data) {
      return res.status(400).json({
        success: false,
        message: "Data to sign is required",
      })
    }

    // Generate key pair for signing (in production, use stored keys)
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: "spki",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
      },
    })

    // Create signature
    const payload = {
      data,
      iss: "symbi-trust-protocol",
      sub: user._id.toString(),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
    }

    const signature = jwt.sign(payload, privateKey, { algorithm })

    // Store signature record
    const signatures = db.collection("signatures")
    await signatures.insertOne({
      userId: user._id,
      data,
      signature,
      publicKey,
      algorithm,
      createdAt: new Date(),
      verified: false,
    })

    res.json({
      success: true,
      data: {
        signature,
        publicKey,
        algorithm,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Trust protocol signing error:", error)
    res.status(500).json({
      success: false,
      message: "Error signing data",
      error: error.message,
    })
  }
}
