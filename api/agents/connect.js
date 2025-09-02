import { getDatabase } from "../../lib/mongodb"
import { verifyToken } from "../../lib/auth"
import { ObjectId } from "mongodb"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" })
  }

  try {
    const user = await verifyToken(req)
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" })
    }

    const db = await getDatabase()
    const { agentId, targetAgentId } = req.body

    const agent = await db.collection("agents").findOne({ _id: new ObjectId(agentId) })
    const targetAgent = await db.collection("agents").findOne({ _id: new ObjectId(targetAgentId) })

    if (!agent || !targetAgent) {
      return res.status(404).json({
        success: false,
        message: "One or both agents not found",
      })
    }

    // Check ownership of source agent
    if (agent.user.toString() !== user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to modify this agent",
      })
    }

    // Check if target agent is public or owned by user
    if (targetAgent.user.toString() !== user.id && !targetAgent.isPublic) {
      return res.status(403).json({
        success: false,
        message: "Target agent is not accessible",
      })
    }

    // Add connection if not already connected
    const connectedAgents = agent.connectedAgents || []
    if (!connectedAgents.some((id) => id.toString() === targetAgentId)) {
      await db.collection("agents").updateOne(
        { _id: new ObjectId(agentId) },
        {
          $push: { connectedAgents: new ObjectId(targetAgentId) },
          $set: { lastActive: new Date() },
        },
      )
    }

    const updatedAgent = await db.collection("agents").findOne({ _id: new ObjectId(agentId) })

    return res.status(200).json({
      success: true,
      message: "Agents connected successfully",
      data: updatedAgent,
    })
  } catch (error) {
    console.error("Agent connect error:", error)
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}
