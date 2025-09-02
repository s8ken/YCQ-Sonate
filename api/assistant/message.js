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

    const { assistantId, threadId, message } = req.body

    if (!assistantId || !threadId || !message) {
      return res.status(400).json({
        success: false,
        message: "Assistant ID, thread ID, and message are required",
      })
    }

    // Add message to thread
    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v2",
      },
      body: JSON.stringify({
        role: "user",
        content: message,
      }),
    })

    if (!messageResponse.ok) {
      throw new Error("Failed to add message to thread")
    }

    // Run the assistant
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v2",
      },
      body: JSON.stringify({
        assistant_id: assistantId,
      }),
    })

    const runData = await runResponse.json()

    if (!runResponse.ok) {
      throw new Error(`Failed to run assistant: ${runData.error?.message || "Unknown error"}`)
    }

    // Poll for completion (simplified - in production use webhooks)
    let run = runData
    while (run.status === "in_progress" || run.status === "queued") {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const statusResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${run.id}`, {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "OpenAI-Beta": "assistants=v2",
        },
      })

      run = await statusResponse.json()
    }

    // Get the assistant's response
    const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "OpenAI-Beta": "assistants=v2",
      },
    })

    const messagesData = await messagesResponse.json()
    const assistantMessage = messagesData.data.find((msg) => msg.role === "assistant" && msg.run_id === run.id)

    res.json({
      success: true,
      data: {
        runId: run.id,
        status: run.status,
        message: assistantMessage?.content[0]?.text?.value || "No response generated",
        threadId,
      },
    })
  } catch (error) {
    console.error("Assistant message error:", error)
    res.status(500).json({
      success: false,
      message: "Error sending message to assistant",
      error: error.message,
    })
  }
}
