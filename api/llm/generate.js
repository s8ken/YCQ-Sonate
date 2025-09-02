import clientPromise from "../../lib/mongodb"
import { verifyToken, extractToken } from "../../lib/auth"

// AI Provider configurations
const AI_PROVIDERS = {
  openai: {
    models: ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"],
    endpoint: "https://api.openai.com/v1/chat/completions",
  },
  anthropic: {
    models: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"],
    endpoint: "https://api.anthropic.com/v1/messages",
  },
  together: {
    models: ["meta-llama/Llama-2-70b-chat-hf", "mistralai/Mixtral-8x7B-Instruct-v0.1"],
    endpoint: "https://api.together.xyz/v1/chat/completions",
  },
  perplexity: {
    models: ["llama-3.1-sonar-small-128k-online", "llama-3.1-sonar-large-128k-online"],
    endpoint: "https://api.perplexity.ai/chat/completions",
  },
}

async function generateWithOpenAI(messages, model, apiKey) {
  const response = await fetch(AI_PROVIDERS.openai.endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    }),
  })

  const data = await response.json()
  return data.choices[0].message.content
}

async function generateWithAnthropic(messages, model, apiKey) {
  const response = await fetch(AI_PROVIDERS.anthropic.endpoint, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 2000,
    }),
  })

  const data = await response.json()
  return data.content[0].text
}

async function generateWithTogether(messages, model, apiKey) {
  const response = await fetch(AI_PROVIDERS.together.endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    }),
  })

  const data = await response.json()
  return data.choices[0].message.content
}

async function generateWithPerplexity(messages, model, apiKey) {
  const response = await fetch(AI_PROVIDERS.perplexity.endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    }),
  })

  const data = await response.json()
  return data.choices[0].message.content
}

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

    const { messages, provider, model } = req.body

    if (!messages || !provider || !model) {
      return res.status(400).json({
        success: false,
        message: "Messages, provider, and model are required",
      })
    }

    // Get API key from environment or user settings
    let apiKey
    switch (provider) {
      case "openai":
        apiKey = process.env.OPENAI_API_KEY
        break
      case "anthropic":
        apiKey = process.env.ANTHROPIC_API_KEY
        break
      case "together":
        apiKey = process.env.TOGETHER_API_KEY
        break
      case "perplexity":
        apiKey = process.env.PERPLEXITY_API_KEY
        break
      default:
        return res.status(400).json({ success: false, message: "Unsupported provider" })
    }

    if (!apiKey) {
      return res.status(400).json({ success: false, message: `API key not configured for ${provider}` })
    }

    // Generate response based on provider
    let response
    switch (provider) {
      case "openai":
        response = await generateWithOpenAI(messages, model, apiKey)
        break
      case "anthropic":
        response = await generateWithAnthropic(messages, model, apiKey)
        break
      case "together":
        response = await generateWithTogether(messages, model, apiKey)
        break
      case "perplexity":
        response = await generateWithPerplexity(messages, model, apiKey)
        break
    }

    res.json({
      success: true,
      data: {
        response,
        provider,
        model,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("LLM generation error:", error)
    res.status(500).json({
      success: false,
      message: "Error generating response",
      error: error.message,
    })
  }
}
