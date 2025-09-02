import { verifyToken } from "../../../lib/auth"

const AI_PROVIDERS = {
  openai: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
  anthropic: ["claude-3-5-sonnet-20241022", "claude-3-haiku-20240307", "claude-3-opus-20240229"],
  together: [
    "meta-llama/Llama-2-70b-chat-hf",
    "mistralai/Mixtral-8x7B-Instruct-v0.1",
    "NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO",
  ],
  perplexity: [
    "llama-3.1-sonar-small-128k-online",
    "llama-3.1-sonar-large-128k-online",
    "llama-3.1-sonar-huge-128k-online",
  ],
  v0: ["v0-1.5-md", "v0-1.5-lg", "v0-1.0-md"],
}

export default async function handler(req, res) {
  try {
    const user = await verifyToken(req)
    if (!user) {
      return res.status(401).json({ success: false, error: "Unauthorized" })
    }

    const { provider } = req.query

    if (req.method === "GET") {
      if (!AI_PROVIDERS[provider]) {
        return res.status(404).json({ success: false, error: "Provider not found" })
      }

      return res.status(200).json({
        success: true,
        provider,
        models: AI_PROVIDERS[provider],
      })
    }

    return res.status(405).json({ success: false, error: "Method not allowed" })
  } catch (error) {
    console.error("Models API error:", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}
