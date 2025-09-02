import { verifyToken } from "../../lib/auth"

const AI_PROVIDERS = {
  openai: {
    name: "OpenAI",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
    endpoint: "https://api.openai.com/v1/chat/completions",
    requiresApiKey: true,
  },
  anthropic: {
    name: "Anthropic",
    models: ["claude-3-5-sonnet-20241022", "claude-3-haiku-20240307", "claude-3-opus-20240229"],
    endpoint: "https://api.anthropic.com/v1/messages",
    requiresApiKey: true,
  },
  together: {
    name: "Together AI",
    models: [
      "meta-llama/Llama-2-70b-chat-hf",
      "mistralai/Mixtral-8x7B-Instruct-v0.1",
      "NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO",
    ],
    endpoint: "https://api.together.xyz/v1/chat/completions",
    requiresApiKey: true,
  },
  perplexity: {
    name: "Perplexity",
    models: [
      "llama-3.1-sonar-small-128k-online",
      "llama-3.1-sonar-large-128k-online",
      "llama-3.1-sonar-huge-128k-online",
    ],
    endpoint: "https://api.perplexity.ai/chat/completions",
    requiresApiKey: true,
  },
  v0: {
    name: "v0",
    models: ["v0-1.5-md", "v0-1.5-lg", "v0-1.0-md"],
    endpoint: "https://api.v0.dev/v1/chat/completions",
    requiresApiKey: true,
  },
}

export default async function handler(req, res) {
  try {
    const user = await verifyToken(req)
    if (!user) {
      return res.status(401).json({ success: false, error: "Unauthorized" })
    }

    if (req.method === "GET") {
      return res.status(200).json({
        success: true,
        providers: AI_PROVIDERS,
      })
    }

    return res.status(405).json({ success: false, error: "Method not allowed" })
  } catch (error) {
    console.error("Providers API error:", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}
