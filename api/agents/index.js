import { connectToDatabase } from "../../lib/mongodb.js"
import { verifyToken } from "../../lib/auth.js"
import { ObjectId } from "mongodb"

export default async function handler(req, res) {
  try {
    const user = await verifyToken(req)
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" })
    }

    const db = await connectToDatabase()

    if (req.method === "GET") {
      // Get all agents for user
      const agents = await db
        .collection("agents")
        .find({ user: new ObjectId(user.id) })
        .sort({ createdAt: -1 })
        .toArray()

      res.status(200).json({
        success: true,
        count: agents.length,
        data: agents,
      })
    } else if (req.method === "POST") {
      // Create new agent
      const {
        name,
        description,
        provider,
        model,
        apiKeyId,
        systemPrompt,
        temperature,
        maxTokens,
        isPublic,
        ciEnabled,
        ciModel,
        contextBridgeEnabled,
        trustScoreThreshold,
      } = req.body

      if (!name || !description || !provider || !model) {
        return res.status(400).json({
          success: false,
          message: "Name, description, provider, and model are required",
        })
      }

      const userData = await db.collection("users").findOne({ _id: new ObjectId(user.id) })
      let selectedApiKeyId = apiKeyId

      // If no API key specified, use the first available key for the provider
      if (!apiKeyId) {
        const defaultKey = userData.apiKeys?.find((key) => key.provider === provider && key.isActive)
        if (!defaultKey) {
          return res.status(400).json({
            success: false,
            message: `No API key found for provider: ${provider}. Please add an API key in Settings.`,
          })
        }
        selectedApiKeyId = defaultKey._id
      }

      const agent = {
        name,
        description,
        user: new ObjectId(user.id),
        provider,
        model,
        apiKeyId: selectedApiKeyId ? new ObjectId(selectedApiKeyId) : null,
        systemPrompt: systemPrompt || "You are a helpful AI assistant.",
        temperature: temperature || 0.7,
        maxTokens: maxTokens || 1000,
        isPublic: isPublic || false,
        ciEnabled: ciEnabled || false,
        ciModel: ciModel || "symbi-core",
        contextBridgeEnabled: contextBridgeEnabled || false,
        trustScoreThreshold: trustScoreThreshold || 0.7,
        connectedAgents: [],
        externalSystems: [],
        metadata: {},
        bondingStatus: "none",
        createdAt: new Date(),
        lastActive: new Date(),
      }

      const result = await db.collection("agents").insertOne(agent)
      agent._id = result.insertedId

      res.status(201).json({
        success: true,
        data: agent,
      })
    } else {
      res.status(405).json({ success: false, message: "Method not allowed" })
    }
  } catch (error) {
    console.error("Error in agents API:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}
