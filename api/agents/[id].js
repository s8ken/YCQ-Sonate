import { getDatabase } from "../../lib/mongodb"
import { verifyToken } from "../../lib/auth"
import { ObjectId } from "mongodb"

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    return res.status(200).end()
  }

  try {
    const user = await verifyToken(req)
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" })
    }

    const db = await getDatabase()
    const { id } = req.query

    if (req.method === "GET") {
      const agent = await db.collection("agents").findOne({ _id: new ObjectId(id) })

      if (!agent) {
        return res.status(404).json({
          success: false,
          message: "Agent not found",
        })
      }

      // Check ownership or public access
      if (agent.user.toString() !== user.id && !agent.isPublic) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to access this agent",
        })
      }

      return res.status(200).json({
        success: true,
        data: agent,
      })
    }

    if (req.method === "PUT") {
      const agent = await db.collection("agents").findOne({ _id: new ObjectId(id) })

      if (!agent) {
        return res.status(404).json({
          success: false,
          message: "Agent not found",
        })
      }

      // Check ownership
      if (agent.user.toString() !== user.id) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this agent",
        })
      }

      const updatedAgent = await db
        .collection("agents")
        .findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: { ...req.body, lastActive: new Date() } },
          { returnDocument: "after" },
        )

      return res.status(200).json({
        success: true,
        data: updatedAgent.value,
      })
    }

    if (req.method === "DELETE") {
      const agent = await db.collection("agents").findOne({ _id: new ObjectId(id) })

      if (!agent) {
        return res.status(404).json({
          success: false,
          message: "Agent not found",
        })
      }

      // Check ownership
      if (agent.user.toString() !== user.id) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to delete this agent",
        })
      }

      await db.collection("agents").deleteOne({ _id: new ObjectId(id) })

      return res.status(200).json({
        success: true,
        message: "Agent deleted successfully",
      })
    }

    return res.status(405).json({ success: false, message: "Method not allowed" })
  } catch (error) {
    console.error("Agent API error:", error)
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}
