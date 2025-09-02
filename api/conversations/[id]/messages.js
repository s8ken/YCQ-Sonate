import { connectToDatabase } from "../../../lib/mongodb.js"
import { verifyToken } from "../../../lib/auth.js"
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

    const { id } = req.query
    const { content, agentId } = req.body

    if (!content?.trim()) {
      return res.status(400).json({ success: false, message: "Message content is required" })
    }

    const db = await connectToDatabase()

    // Verify conversation exists and user has access
    const conversation = await db.collection("conversations").findOne({
      _id: new ObjectId(id),
      user: new ObjectId(user.id),
    })

    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" })
    }

    // Create user message
    const userMessage = {
      _id: new ObjectId(),
      content: content.trim(),
      sender: "user",
      timestamp: new Date(),
      agentId: agentId ? new ObjectId(agentId) : null,
    }

    // Add user message to conversation
    await db.collection("conversations").updateOne(
      { _id: new ObjectId(id) },
      {
        $push: { messages: userMessage },
        $set: { updatedAt: new Date() },
      },
    )

    let agentResponse = null
    if (agentId) {
      try {
        agentResponse = await generateAgentResponse(db, agentId, content, conversation.messages || [], user)

        if (agentResponse) {
          // Add agent response to conversation
          await db.collection("conversations").updateOne(
            { _id: new ObjectId(id) },
            {
              $push: { messages: agentResponse },
              $set: { updatedAt: new Date() },
            },
          )
        }
      } catch (error) {
        console.error("Error generating agent response:", error)
        // Continue without agent response if generation fails
      }
    }

    // Return both messages
    const messages = [userMessage]
    if (agentResponse) {
      messages.push(agentResponse)
    }

    res.status(201).json({
      success: true,
      data: messages,
    })
  } catch (error) {
    console.error("Error in messages API:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

async function generateAgentResponse(db, agentId, userMessage, conversationHistory, user) {
  try {
    // Get agent configuration
    const agent = await db.collection("agents").findOne({
      _id: new ObjectId(agentId),
      $or: [{ user: new ObjectId(user.id) }, { isPublic: true }],
    })

    if (!agent) {
      throw new Error("Agent not found or not accessible")
    }

    // Get user's API key for the agent's provider
    const userData = await db.collection("users").findOne({ _id: new ObjectId(user.id) })
    const apiKey = userData.apiKeys?.find(
      (key) => key._id.toString() === agent.apiKeyId?.toString() || (key.provider === agent.provider && key.isActive),
    )

    if (!apiKey) {
      throw new Error(`No API key found for provider: ${agent.provider}`)
    }

    // Build conversation context
    const messages = [{ role: "system", content: agent.systemPrompt || "You are a helpful AI assistant." }]

    // Add recent conversation history (last 10 messages)
    const recentHistory = conversationHistory.slice(-10)
    for (const msg of recentHistory) {
      if (msg.sender === "user") {
        messages.push({ role: "user", content: msg.content })
      } else if (msg.sender === "agent") {
        messages.push({ role: "assistant", content: msg.content })
      }
    }

    // Add current user message
    messages.push({ role: "user", content: userMessage })

    // Generate response based on provider
    let responseContent

    if (agent.provider === "openai") {
      responseContent = await generateOpenAIResponse(messages, agent, apiKey.key)
    } else if (agent.provider === "anthropic") {
      responseContent = await generateAnthropicResponse(messages, agent, apiKey.key)
    } else if (agent.provider === "together") {
      responseContent = await generateTogetherResponse(messages, agent, apiKey.key)
    } else if (agent.provider === "perplexity") {
      responseContent = await generatePerplexityResponse(messages, agent, apiKey.key)
    } else {
      throw new Error(`Unsupported provider: ${agent.provider}`)
    }

    // Create agent response message
    return {
      _id: new ObjectId(),
      content: responseContent,
      sender: "agent",
      agentId: new ObjectId(agentId),
      timestamp: new Date(),
      ciModel: agent.ciModel || null,
      trustScore: Math.random() * 0.3 + 0.7, // Simulated trust score
      contextTags: ["agent-response", "ai-generated"],
    }
  } catch (error) {
    console.error("Error generating agent response:", error)
    return null
  }
}

async function generateOpenAIResponse(messages, agent, apiKey) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: agent.model || "gpt-4",
      messages: messages,
      temperature: agent.temperature || 0.7,
      max_tokens: agent.maxTokens || 1000,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || "Sorry, I could not generate a response."
}

async function generateAnthropicResponse(messages, agent, apiKey) {
  // Convert messages format for Anthropic
  const systemMessage = messages.find((m) => m.role === "system")?.content || ""
  const conversationMessages = messages.filter((m) => m.role !== "system")

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: agent.model || "claude-3-sonnet-20240229",
      system: systemMessage,
      messages: conversationMessages,
      max_tokens: agent.maxTokens || 1000,
      temperature: agent.temperature || 0.7,
    }),
  })

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.content[0]?.text || "Sorry, I could not generate a response."
}

async function generateTogetherResponse(messages, agent, apiKey) {
  const response = await fetch("https://api.together.xyz/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: agent.model || "meta-llama/Llama-2-70b-chat-hf",
      messages: messages,
      temperature: agent.temperature || 0.7,
      max_tokens: agent.maxTokens || 1000,
    }),
  })

  if (!response.ok) {
    throw new Error(`Together API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || "Sorry, I could not generate a response."
}

async function generatePerplexityResponse(messages, agent, apiKey) {
  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: agent.model || "llama-3.1-sonar-small-128k-online",
      messages: messages,
      temperature: agent.temperature || 0.7,
      max_tokens: agent.maxTokens || 1000,
    }),
  })

  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || "Sorry, I could not generate a response."
}
