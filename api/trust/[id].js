import { getDatabase } from "../../lib/mongodb"
import { verifyToken, extractToken } from "../../lib/auth"
import { ObjectId } from "mongodb"

export default async function handler(req, res) {
  try {
    // Authenticate user
    const token = extractToken(req)
    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" })
    }

    const decoded = verifyToken(token)
    const db = await getDatabase()
    const users = db.collection("users")
    const trustDeclarations = db.collection("trustdeclarations")

    const user = await users.findOne({ _id: new ObjectId(decoded.id) })
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" })
    }

    const { id } = req.query

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID format" })
    }

    if (req.method === "GET") {
      // Get single trust declaration
      const declaration = await trustDeclarations.findOne({ _id: new ObjectId(id) })

      if (!declaration) {
        return res.status(404).json({ success: false, message: "Trust declaration not found" })
      }

      return res.json({
        success: true,
        data: declaration,
      })
    }

    if (req.method === "PUT") {
      // Update trust declaration
      const { trustDeclaration } = req.body

      if (!trustDeclaration) {
        return res.status(400).json({
          success: false,
          message: "Trust declaration data is required",
        })
      }

      // Recalculate scores if trust articles changed
      const trustArticles = trustDeclaration.trust_articles || {}
      const articleCount = Object.keys(trustArticles).length
      const compliantCount = Object.values(trustArticles).filter((article) => article.compliant).length

      const complianceScore = articleCount > 0 ? compliantCount / articleCount : 0
      const guiltScore = 1 - complianceScore

      const updateData = {
        trustDeclaration: {
          ...trustDeclaration,
          compliance_score: complianceScore,
          guilt_score: guiltScore,
        },
        updatedAt: new Date(),
      }

      const result = await trustDeclarations.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: "after" },
      )

      if (!result.value) {
        return res.status(404).json({ success: false, message: "Trust declaration not found" })
      }

      return res.json({
        success: true,
        data: result.value,
        message: "Trust declaration updated successfully",
      })
    }

    if (req.method === "DELETE") {
      // Delete trust declaration
      const result = await trustDeclarations.deleteOne({ _id: new ObjectId(id) })

      if (result.deletedCount === 0) {
        return res.status(404).json({ success: false, message: "Trust declaration not found" })
      }

      return res.json({
        success: true,
        message: "Trust declaration deleted successfully",
      })
    }

    return res.status(405).json({ success: false, message: "Method not allowed" })
  } catch (error) {
    console.error("Trust API error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}
