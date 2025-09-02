import clientPromise from "../../lib/mongodb"
import { verifyToken, extractToken } from "../../lib/auth"

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

    const { name, instructions, model = "gpt-4" } = req.body

    if (!name || !instructions) {
      return res.status(400).json({
        success: false,
        message: "Name and instructions are required",
      })
    }

    // Create OpenAI Assistant
    const response = await fetch("https://api.openai.com/v1/assistants", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v2",
      },
      body: JSON.stringify({
        name,
        instructions,
        model,
        tools: [
          { type: "function", function: { name: "get_user_profile", description: "Get user profile information" } },
          { type: "function", function: { name: "get_trust_declarations", description: "Get trust declarations" } },
          {
            type: "function",
            function: { name: "create_trust_declaration", description: "Create new trust declaration" },
          },
          {
            type: "function",
            function: { name: "generate_ai_response", description: "Generate AI response using different providers" },
          },
        ],
      }),
    })

    const assistantData = await response.json()

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${assistantData.error?.message || "Unknown error"}`)
    }

    // Store assistant in database
    const assistants = db.collection("assistants")
    await assistants.insertOne({
      userId: user._id,
      assistantId: assistantData.id,
      name: assistantData.name,
      instructions: assistantData.instructions,
      model: assistantData.model,
      tools: assistantData.tools,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    res.status(201).json({
      success: true,
      data: assistantData,
      message: "Assistant created successfully",
    })
  } catch (error) {
    console.error("Assistant creation error:", error)
    res.status(500).json({
      success: false,
      message: "Error creating assistant",
      error: error.message,
    })
  }
}
