import { getDatabase } from "../../../lib/mongodb"
import { verifyToken } from "../../../lib/auth"
import { ObjectId } from "mongodb"

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    return res.status(200).end()
  }

  try {
    const user = await verifyToken(req)
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" })
    }

    const db = await getDatabase()
    const { id: assistantId } = req.query

    if (req.method === "POST") {
      const userData = await db.collection("users").findOne({ _id: new ObjectId(user.id) })
      const openaiKey = userData.apiKeys?.find((key) => key.provider === "openai")?.key

      if (!openaiKey) {
        return res.status(400).json({
          success: false,
          message: "OpenAI API key not found. Please add your OpenAI API key in settings.",
        })
      }

      // Create thread using OpenAI API
      const response = await fetch("https://api.openai.com/v1/threads", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
          "OpenAI-Beta": "assistants=v2",
        },
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`)
      }

      const thread = await response.json()

      // Store thread in database
      const threadDoc = {
        threadId: thread.id,
        assistantId,
        user: new ObjectId(user.id),
        createdAt: new Date(),
        lastActive: new Date(),
        messages: [],
      }

      await db.collection("assistant_threads").insertOne(threadDoc)

      return res.status(201).json({
        success: true,
        thread: {
          id: thread.id,
          created_at: thread.created_at,
        },
        message: "Thread created successfully",
      })
    }

    if (req.method === "GET") {
      const threads = await db
        .collection("assistant_threads")
        .find({
          assistantId,
          user: new ObjectId(user.id),
        })
        .sort({ lastActive: -1 })
        .toArray()

      return res.status(200).json({
        success: true,
        threads,
        count: threads.length,
      })
    }

    return res.status(405).json({ success: false, message: "Method not allowed" })
  } catch (error) {
    console.error("Assistant threads API error:", error)
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}
