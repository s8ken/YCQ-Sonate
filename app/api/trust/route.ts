import type { NextRequest } from "next/server"
import { z } from "zod"
import {
  withApiMiddleware,
  createSuccessResponse,
  createErrorResponse,
  commonSchemas,
  type ApiContext,
} from "../../../lib/api-middleware"

const trustDeclarationSchema = z.object({
  agent_id: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z0-9_-]+$/, "Agent ID must be alphanumeric with hyphens/underscores"),
  agent_name: z.string().min(1).max(200).trim(),
  compliance_score: z.number().min(0).max(1).optional(),
  guilt_score: z.number().min(0).max(1).optional(),
  trust_articles: z.object({
    inspection_mandate: z.boolean(),
    consent_architecture: z.boolean(),
    ethical_override: z.boolean(),
    continuous_validation: z.boolean(),
    right_to_disconnect: z.boolean(),
    moral_recognition: z.boolean(),
  }),
  notes: z.string().max(1000).optional(),
  metadata: z.record(z.any()).optional(),
})

const querySchema = commonSchemas.pagination.extend({
  agent_id: z.string().optional(),
  min_compliance_score: z.coerce.number().min(0).max(1).optional(),
  max_guilt_score: z.coerce.number().min(0).max(1).optional(),
  sort_by: z.enum(["declaration_date", "compliance_score", "guilt_score"]).default("declaration_date"),
  sort_order: z.enum(["asc", "desc"]).default("desc"),
})

async function getTrustDeclarations(req: NextRequest, context: ApiContext) {
  const url = new URL(req.url)
  const query = Object.fromEntries(url.searchParams.entries())
  const { page, limit, agent_id, min_compliance_score, max_guilt_score, sort_by, sort_order } = querySchema.parse(query)

  // Build filter
  const filter: any = {}

  if (agent_id) filter.agent_id = agent_id
  if (min_compliance_score !== undefined) {
    filter.compliance_score = { $gte: min_compliance_score }
  }
  if (max_guilt_score !== undefined) {
    filter.guilt_score = { ...filter.guilt_score, $lte: max_guilt_score }
  }

  // Build sort
  const sortOrder = sort_order === "asc" ? 1 : -1

  try {
    const [declarations, total] = await Promise.all([
      context.db
        .collection("trust_declarations")
        .find(filter)
        .sort({ [sort_by]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      context.db.collection("trust_declarations").countDocuments(filter),
    ])

    return createSuccessResponse(
      {
        declarations,
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: limit,
        },
      },
      undefined,
      context.requestId,
    )
  } catch (error) {
    console.error("Error fetching trust declarations:", error)
    return createErrorResponse(
      500,
      "Database Error",
      "Failed to fetch trust declarations",
      undefined,
      context.requestId,
    )
  }
}

async function createTrustDeclaration(req: NextRequest, context: ApiContext) {
  const validatedBody = (req as any).validatedBody

  try {
    // Calculate compliance score based on trust articles
    const trustArticles = validatedBody.trust_articles
    const totalArticles = Object.keys(trustArticles).length
    const compliantArticles = Object.values(trustArticles).filter(Boolean).length
    const calculatedComplianceScore = compliantArticles / totalArticles

    // Create trust declaration
    const declaration = {
      ...validatedBody,
      compliance_score: validatedBody.compliance_score ?? calculatedComplianceScore,
      guilt_score: validatedBody.guilt_score ?? 1 - calculatedComplianceScore,
      declaration_date: new Date(),
      last_validated: new Date(),
      created_by: context.user!.id,
      audit_history: [],
      signature: null, // TODO: Implement cryptographic signing
      verification_status: "pending",
    }

    const result = await context.db.collection("trust_declarations").insertOne(declaration)
    declaration._id = result.insertedId

    // Log trust declaration creation
    console.log(
      JSON.stringify({
        type: "trust_declaration_created",
        declarationId: result.insertedId.toString(),
        agentId: declaration.agent_id,
        userId: context.user!.id,
        complianceScore: declaration.compliance_score,
        timestamp: new Date().toISOString(),
      }),
    )

    return createSuccessResponse(declaration, "Trust declaration created successfully", context.requestId, 201)
  } catch (error) {
    console.error("Error creating trust declaration:", error)
    return createErrorResponse(
      500,
      "Database Error",
      "Failed to create trust declaration",
      undefined,
      context.requestId,
    )
  }
}

export const GET = withApiMiddleware(getTrustDeclarations, {
  auth: "required",
  methods: ["GET"],
  rateLimit: "trust",
  validation: {
    query: querySchema,
  },
})

export const POST = withApiMiddleware(createTrustDeclaration, {
  auth: "required",
  methods: ["POST"],
  rateLimit: "trust",
  validation: {
    body: trustDeclarationSchema,
  },
})
