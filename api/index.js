export default function handler(req, res) {
  res.json({
    success: true,
    message: "SYMBI Trust Protocol API is running",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      trust: "/api/trust",
      assistant: "/api/assistant",
      llm: "/api/llm",
    },
    documentation: "Visit /api/trust for trust protocol endpoints",
    serverless: true,
    timestamp: new Date().toISOString(),
  })
}
