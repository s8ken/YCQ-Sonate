import { getDatabase } from "../../lib/mongodb"
import { verifyToken } from "../../lib/auth"

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

    if (req.method === "GET") {
      const agents = await db.collection("agents").find({ isPublic: true }).sort({ createdAt: -1 }).toArray()

      // Populate user information for each agent
      for (const agent of agents) {
        const userData = await db
          .collection("users")
          .findOne({ _id: agent.user }, { projection: { name: 1, email: 1 } })
        agent.user = userData
      }

      return res.status(200).json({
        success: true,
        count: agents.length,
        data: agents,
      })
    }

    return res.status(405).json({ success: false, message: "Method not allowed" })
  } catch (error) {
    console.error("Public agents API error:", error)
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}
