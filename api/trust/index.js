import { verifyToken, extractToken } from "../../lib/auth"
import { ObjectId } from "mongodb"
import { getDatabase } from "../../lib/mongodb"

export default async function handler(req, res) {
  try {
    // Authenticate user
    const token = extractToken(req)
    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" })
    }

    const decoded = verifyToken(token)
    const db = await getDatabase()
    const users = db.collection("users")
    const trustDeclarations = db.collection("trustdeclarations")

    const user = await users.findOne({ _id: new ObjectId(decoded.id) })
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" })
    }

    if (req.method === "GET") {
      // Get all trust declarations with filtering and pagination
      const {
        page = 1,
        limit = 10,
        agent_id,
        min_compliance_score,
        max_guilt_score,
        sort_by = "declaration_date",
        sort_order = "desc",
      } = req.query

      const filter = {}
      if (agent_id) filter["trustDeclaration.agent_id"] = agent_id
      if (min_compliance_score)
        filter["trustDeclaration.compliance_score"] = { $gte: Number.parseFloat(min_compliance_score) }
      if (max_guilt_score) filter["trustDeclaration.guilt_score"] = { $lte: Number.parseFloat(max_guilt_score) }

      const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)
      const sortOrder = sort_order === "asc" ? 1 : -1

      const declarations = await trustDeclarations
        .find(filter)
        .sort({ [sort_by]: sortOrder })
        .skip(skip)
        .limit(Number.parseInt(limit))
        .toArray()

      const total = await trustDeclarations.countDocuments(filter)

      return res.json({
        success: true,
        data: {
          declarations,
          pagination: {
            page: Number.parseInt(page),
            limit: Number.parseInt(limit),
            total,
            pages: Math.ceil(total / Number.parseInt(limit)),
          },
        },
      })
    }

    if (req.method === "POST") {
      // Create new trust declaration
      const { trustDeclaration } = req.body

      if (!trustDeclaration) {
        return res.status(400).json({
          success: false,
          message: "Trust declaration is required",
        })
      }

      // Calculate compliance and guilt scores
      const trustArticles = trustDeclaration.trust_articles || {}
      const articleCount = Object.keys(trustArticles).length
      const compliantCount = Object.values(trustArticles).filter((article) => article.compliant).length

      const complianceScore = articleCount > 0 ? compliantCount / articleCount : 0
      const guiltScore = 1 - complianceScore

      const newDeclaration = {
        trustDeclaration: {
          ...trustDeclaration,
          compliance_score: complianceScore,
          guilt_score: guiltScore,
          declaration_date: new Date().toISOString(),
        },
        userId: user._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = await trustDeclarations.insertOne(newDeclaration)
      const created = await trustDeclarations.findOne({ _id: result.insertedId })

      return res.status(201).json({
        success: true,
        data: created,
        message: "Trust declaration created successfully",
      })
    }

    return res.status(405).json({ success: false, message: "Method not allowed" })
  } catch (error) {
    console.error("Trust API error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}
