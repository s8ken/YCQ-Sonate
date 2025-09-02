import { getDatabase } from "../../lib/mongodb"
import { verifyToken } from "../../lib/auth"

export default async function handler(req, res) {
  try {
    const user = await verifyToken(req)
    if (!user) {
      return res.status(401).json({ success: false, error: "Unauthorized" })
    }

    const db = await getDatabase()
    const conversations = db.collection("conversations")

    if (req.method === "GET") {
      const page = Number.parseInt(req.query.page) || 1
      const limit = Number.parseInt(req.query.limit) || 20
      const skip = (page - 1) * limit

      const userConversations = await conversations
        .find({ userId: user.id })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray()

      const total = await conversations.countDocuments({ userId: user.id })

      return res.status(200).json({
        success: true,
        conversations: userConversations,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      })
    }

    if (req.method === "POST") {
      const { title, agentId, type = "chat" } = req.body

      if (!title) {
        return res.status(400).json({ success: false, error: "Title is required" })
      }

      const newConversation = {
        title,
        agentId: agentId || null,
        type,
        userId: user.id,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      }

      const result = await conversations.insertOne(newConversation)
      const conversation = await conversations.findOne({ _id: result.insertedId })

      return res.status(201).json({
        success: true,
        conversation,
      })
    }

    return res.status(405).json({ success: false, error: "Method not allowed" })
  } catch (error) {
    console.error("Conversations API error:", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}
