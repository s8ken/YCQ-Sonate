import { getDatabase } from "../../../lib/mongodb"
import { verifyToken } from "../../../lib/auth"
import { ObjectId } from "mongodb"

export default async function handler(req, res) {
  try {
    const user = await verifyToken(req)
    if (!user) {
      return res.status(401).json({ success: false, error: "Unauthorized" })
    }

    const { id } = req.query
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: "Invalid conversation ID" })
    }

    const db = await getDatabase()
    const conversations = db.collection("conversations")

    if (req.method === "GET") {
      const conversation = await conversations.findOne({
        _id: new ObjectId(id),
        userId: user.id,
      })

      if (!conversation) {
        return res.status(404).json({ success: false, error: "Conversation not found" })
      }

      return res.status(200).json({
        success: true,
        conversation,
      })
    }

    if (req.method === "PUT") {
      const { title, isActive } = req.body
      const updateData = { updatedAt: new Date() }

      if (title !== undefined) updateData.title = title
      if (isActive !== undefined) updateData.isActive = isActive

      const result = await conversations.updateOne({ _id: new ObjectId(id), userId: user.id }, { $set: updateData })

      if (result.matchedCount === 0) {
        return res.status(404).json({ success: false, error: "Conversation not found" })
      }

      const updatedConversation = await conversations.findOne({ _id: new ObjectId(id) })

      return res.status(200).json({
        success: true,
        conversation: updatedConversation,
      })
    }

    if (req.method === "DELETE") {
      const result = await conversations.deleteOne({
        _id: new ObjectId(id),
        userId: user.id,
      })

      if (result.deletedCount === 0) {
        return res.status(404).json({ success: false, error: "Conversation not found" })
      }

      return res.status(200).json({
        success: true,
        message: "Conversation deleted successfully",
      })
    }

    return res.status(405).json({ success: false, error: "Method not allowed" })
  } catch (error) {
    console.error("Conversation API error:", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}
