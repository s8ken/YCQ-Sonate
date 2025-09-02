import { getDatabase } from "../../../lib/mongodb"
import { verifyAuth } from "../../../lib/auth"
import { ObjectId } from "mongodb"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" })
  }

  try {
    const user = await verifyAuth(req)
    if (!user) {
      return res.status(401).json({ success: false, error: "Unauthorized" })
    }

    const { id } = req.query
    const { action, accepted } = req.body
    const db = await getDatabase()

    const agent = await db.collection("agents").findOne({
      _id: new ObjectId(id),
      user: new ObjectId(user.id),
    })

    if (!agent) {
      return res.status(404).json({ success: false, error: "Agent not found" })
    }

    if (action === "initiate") {
      await db.collection("agents").updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            bondingStatus: "in_progress",
            bondingStarted: new Date(),
          },
        },
      )
    } else if (action === "complete") {
      await db.collection("agents").updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            bondingStatus: accepted ? "bonded" : "rejected",
            bondingCompleted: new Date(),
            isBonded: accepted,
          },
        },
      )
    }

    res.json({ success: true, message: "Bonding action completed" })
  } catch (error) {
    console.error("Bonding error:", error)
    res.status(500).json({ success: false, error: "Internal server error" })
  }
}
