import type { NextRequest } from "next/server"
import { z } from "zod"
import { ObjectId } from "mongodb"
import {
  withApiMiddleware,
  createSuccessResponse,
  createErrorResponse,
  commonSchemas,
  type ApiContext,
} from "../../../lib/api-middleware"

const createAgentSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  description: z.string().min(1).max(500).trim(),
  provider: z.enum(["openai", "anthropic", "together", "perplexity"]),
  model: z.string().min(1).max(100),
  apiKeyId: z.string().optional(),
  systemPrompt: z.string().max(2000).default("You are a helpful AI assistant."),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().int().min(1).max(4000).default(1000),
  isPublic: z.boolean().default(false),
  ciEnabled: z.boolean().default(false),
  ciModel: z.string().default("symbi-core"),
  contextBridgeEnabled: z.boolean().default(false),
  trustScoreThreshold: z.number().min(0).max(1).default(0.7),
})

const querySchema = commonSchemas.pagination.extend({
  search: z.string().optional(),
  provider: z.string().optional(),
  isPublic: z.coerce.boolean().optional(),
})

async function getAgents(req: NextRequest, context: ApiContext) {
  const url = new URL(req.url)
  const query = Object.fromEntries(url.searchParams.entries())
  const { page, limit, search, provider, isPublic, sort, order } = querySchema.parse(query)

  // Build filter
  const filter: any = { user: new ObjectId(context.user!.id) }

  if (search) {
    filter.$or = [{ name: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
  }

  if (provider) filter.provider = provider
  if (isPublic !== undefined) filter.isPublic = isPublic

  // Build sort
  const sortField = sort || "createdAt"
  const sortOrder = order === "asc" ? 1 : -1

  try {
    const [agents, total] = await Promise.all([
      context.db
        .collection("agents")
        .find(filter)
        .sort({ [sortField]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      context.db.collection("agents").countDocuments(filter),
    ])

    return createSuccessResponse(
      {
        agents,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      undefined,
      context.requestId,
    )
  } catch (error) {
    console.error("Error fetching agents:", error)
    return createErrorResponse(500, "Database Error", "Failed to fetch agents", undefined, context.requestId)
  }
}

async function createAgent(req: NextRequest, context: ApiContext) {
  const validatedBody = (req as any).validatedBody

  try {
    // Check if user has API key for the provider
    const userData = await context.db.collection("users").findOne({
      _id: new ObjectId(context.user!.id),
    })

    let selectedApiKeyId = validatedBody.apiKeyId

    // If no API key specified, use the first available key for the provider
    if (!selectedApiKeyId) {
      const defaultKey = userData?.apiKeys?.find((key: any) => key.provider === validatedBody.provider && key.isActive)

      if (!defaultKey) {
        return createErrorResponse(
          400,
          "Missing API Key",
          `No API key found for provider: ${validatedBody.provider}. Please add an API key in Settings.`,
          { provider: validatedBody.provider },
          context.requestId,
        )
      }
      selectedApiKeyId = defaultKey._id
    }

    // Create agent document
    const agent = {
      ...validatedBody,
      user: new ObjectId(context.user!.id),
      apiKeyId: selectedApiKeyId ? new ObjectId(selectedApiKeyId) : null,
      connectedAgents: [],
      externalSystems: [],
      metadata: {},
      bondingStatus: "none",
      trustScore: {
        compliance: 0.9,
        guilt: 0.1,
        lastUpdated: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActive: new Date(),
    }

    const result = await context.db.collection("agents").insertOne(agent)
    agent._id = result.insertedId

    return createSuccessResponse(agent, "Agent created successfully", context.requestId, 201)
  } catch (error) {
    console.error("Error creating agent:", error)
    return createErrorResponse(500, "Database Error", "Failed to create agent", undefined, context.requestId)
  }
}

// Export handlers with middleware
export const GET = withApiMiddleware(getAgents, {
  auth: "required",
  methods: ["GET"],
  rateLimit: "agents",
  validation: {
    query: querySchema,
  },
})

export const POST = withApiMiddleware(createAgent, {
  auth: "required",
  methods: ["POST"],
  rateLimit: "agents",
  validation: {
    body: createAgentSchema,
  },
})
