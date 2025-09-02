import { getDatabase } from "../../lib/mongodb"
import { verifyToken } from "../../lib/auth"
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

    if (req.method === "GET") {
      const pipeline = [
        { $match: { user: new ObjectId(user.id) } },
        {
          $group: {
            _id: null,
            totalDeclarations: { $sum: 1 },
            avgComplianceScore: { $avg: "$compliance_score" },
            avgGuiltScore: { $avg: "$guilt_score" },
            highComplianceCount: {
              $sum: { $cond: [{ $gte: ["$compliance_score", 0.8] }, 1, 0] },
            },
            lowGuiltCount: {
              $sum: { $cond: [{ $lte: ["$guilt_score", 0.2] }, 1, 0] },
            },
          },
        },
      ]

      const analytics = await db.collection("trust_declarations").aggregate(pipeline).toArray()

      // Get recent declarations
      const recentDeclarations = await db
        .collection("trust_declarations")
        .find({ user: new ObjectId(user.id) })
        .sort({ declaration_date: -1 })
        .limit(5)
        .toArray()

      // Get trust score distribution
      const scoreDistribution = await db
        .collection("trust_declarations")
        .aggregate([
          { $match: { user: new ObjectId(user.id) } },
          {
            $bucket: {
              groupBy: "$compliance_score",
              boundaries: [0, 0.2, 0.4, 0.6, 0.8, 1.0],
              default: "other",
              output: { count: { $sum: 1 } },
            },
          },
        ])
        .toArray()

      const result = analytics[0] || {
        totalDeclarations: 0,
        avgComplianceScore: 0,
        avgGuiltScore: 0,
        highComplianceCount: 0,
        lowGuiltCount: 0,
      }

      return res.status(200).json({
        success: true,
        data: {
          ...result,
          recentDeclarations,
          scoreDistribution,
          trustHealthScore: result.avgComplianceScore * 0.7 + (1 - result.avgGuiltScore) * 0.3,
        },
      })
    }

    return res.status(405).json({ success: false, message: "Method not allowed" })
  } catch (error) {
    console.error("Trust analytics API error:", error)
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}
