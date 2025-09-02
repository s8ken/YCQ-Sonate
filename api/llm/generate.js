import { getDatabase } from "../../lib/mongodb"
import { verifyToken, extractToken } from "../../lib/auth"
import { withSecurity, handleValidationErrors } from "../../lib/security"
import { body } from "express-validator"

const validateGeneration = [
  body("messages").isArray({ min: 1 }).withMessage("Messages array is required and must not be empty"),
  body("messages.*.role")
    .isIn(["user", "assistant", "system"])
    .withMessage("Message role must be user, assistant, or system"),
  body("messages.*.content")
    .isString()
    .isLength({ min: 1, max: 10000 })
    .withMessage("Message content must be 1-10000 characters"),
  body("provider")
    .isIn(["openai", "anthropic", "together", "perplexity", "v0"])
    .withMessage("Provider must be one of: openai, anthropic, together, perplexity, v0"),
  body("model").isString().isLength({ min: 1, max: 100 }).withMessage("Model is required"),
]

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
  v0: {
    models: ["v0-1.5-md", "v0-1.5-lg", "v0-1.0-md"],
    endpoint: "https://api.v0.dev/v1/chat/completions",
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

async function generateWithV0(messages, model, apiKey) {
  const response = await fetch(AI_PROVIDERS.v0.endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_completion_tokens: 2000,
    }),
  })

  if (!response.ok) {
    throw new Error(`v0 API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

async function llmGenerateHandler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" })
  }

  const validationError = handleValidationErrors(req, res)
  if (validationError) return validationError

  try {
    // Authenticate user
    const token = extractToken(req)
    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" })
    }

    const decoded = verifyToken(token)
    const db = await getDatabase()
    const users = db.collection("users")

    const user = await users.findOne({ _id: decoded.id })
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" })
    }

    const { messages, provider, model } = req.body

    if (!AI_PROVIDERS[provider].models.includes(model)) {
      return res.status(400).json({
        success: false,
        message: `Model ${model} is not supported by provider ${provider}`,
        supportedModels: AI_PROVIDERS[provider].models,
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
      case "v0":
        apiKey = process.env.V0_API_KEY
        break
      default:
        return res.status(400).json({ success: false, message: "Unsupported provider" })
    }

    if (!apiKey) {
      return res.status(400).json({ success: false, message: `API key not configured for ${provider}` })
    }

    console.log(`[v0] LLM generation request: ${provider}/${model} by user ${user._id}`)

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
      case "v0":
        response = await generateWithV0(messages, model, apiKey)
        break
    }

    const generations = db.collection("generations")
    await generations.insertOne({
      userId: user._id,
      provider,
      model,
      messageCount: messages.length,
      responseLength: response.length,
      timestamp: new Date(),
      success: true,
    })

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

    try {
      const db = await getDatabase()
      const generations = db.collection("generations")
      await generations.insertOne({
        userId: req.user?._id,
        provider: req.body?.provider,
        model: req.body?.model,
        error: error.message,
        timestamp: new Date(),
        success: false,
      })
    } catch (dbError) {
      console.error("Failed to log generation error:", dbError)
    }

    res.status(500).json({
      success: false,
      message: "Error generating response",
      error: error.message,
    })
  }
}

export default withSecurity(llmGenerateHandler, {
  rateLimit: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20, // 20 AI generations per minute
  },
})
