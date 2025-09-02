import { getDatabase } from "../../../lib/mongodb"
import { verifyToken } from "../../../lib/auth"
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
    const { id } = req.query
    const { name, type, endpoint, apiKey, config } = req.body

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
        message: "Not authorized to modify this agent",
      })
    }

    // Validate required fields
    if (!name || !type || !endpoint) {
      return res.status(400).json({
        success: false,
        message: "Name, type, and endpoint are required",
      })
    }

    // Check if external system with same name already exists
    const existingSystems = agent.externalSystems || []
    const existingSystem = existingSystems.find((sys) => sys.name === name)
    if (existingSystem) {
      return res.status(400).json({
        success: false,
        message: "External system with this name already exists",
      })
    }

    const newSystem = {
      name,
      type,
      endpoint,
      apiKey,
      config: config || {},
      isActive: true,
      lastSync: new Date(),
    }

    await db.collection("agents").updateOne(
      { _id: new ObjectId(id) },
      {
        $push: { externalSystems: newSystem },
        $set: { lastActive: new Date() },
      },
    )

    const updatedAgent = await db.collection("agents").findOne({ _id: new ObjectId(id) })

    return res.status(201).json({
      success: true,
      message: "External system added successfully",
      data: updatedAgent,
    })
  } catch (error) {
    console.error("External system add error:", error)
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}
