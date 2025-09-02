const OpenAI = require("openai")
const User = require("../models/user.model")
const Agent = require("../models/agent.model")
const Context = require("../models/context.model")
const Conversation = require("../models/conversation.model")
const TrustDeclaration = require("../models/trust.model")
const TrustProtocolService = require("./trust-protocol.service")

class AssistantService {
  constructor() {
    this.openai = null
    this.assistants = new Map() // Cache for assistant instances
  }

  // Initialize OpenAI client with user's API key
  initializeClient(apiKey) {
    if (!apiKey) {
      throw new Error("OpenAI API key is required")
    }
    this.openai = new OpenAI({ apiKey })
    return this.openai
  }

  // Function definitions for app data access
  getFunctionDefinitions() {
    return [
      {
        type: "function",
        function: {
          name: "get_user_profile",
          description: "Get the current user's profile information",
          parameters: {
            type: "object",
            properties: {},
            required: [],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "get_user_agents",
          description: "Get all agents created by the user",
          parameters: {
            type: "object",
            properties: {
              limit: {
                type: "number",
                description: "Maximum number of agents to return (default: 10)",
              },
            },
            required: [],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "get_agent_details",
          description: "Get detailed information about a specific agent",
          parameters: {
            type: "object",
            properties: {
              agentId: {
                type: "string",
                description: "The ID of the agent to retrieve",
              },
            },
            required: ["agentId"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "search_contexts",
          description: "Search through user's contexts and knowledge base",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "Search query to find relevant contexts",
              },
              limit: {
                type: "number",
                description: "Maximum number of results to return (default: 5)",
              },
              source: {
                type: "string",
                description: "Filter by context source (symbi, overseer, system)",
                enum: ["symbi", "overseer", "system"],
              },
            },
            required: ["query"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "get_conversations",
          description: "Get user's recent conversations",
          parameters: {
            type: "object",
            properties: {
              limit: {
                type: "number",
                description: "Maximum number of conversations to return (default: 10)",
              },
              agentId: {
                type: "string",
                description: "Filter conversations by specific agent ID",
              },
            },
            required: [],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "get_trust_declarations",
          description: "Get trust declarations with filtering and analytics",
          parameters: {
            type: "object",
            properties: {
              agentId: {
                type: "string",
                description: "Filter by specific agent ID",
              },
              minComplianceScore: {
                type: "number",
                description: "Minimum compliance score filter (0-1)",
              },
              maxGuiltScore: {
                type: "number",
                description: "Maximum guilt score filter (0-1)",
              },
              limit: {
                type: "number",
                description: "Maximum number of declarations to return (default: 10)",
              },
            },
            required: [],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "create_trust_declaration",
          description: "Create a new trust declaration for an agent",
          parameters: {
            type: "object",
            properties: {
              agentId: {
                type: "string",
                description: "ID of the agent making the declaration",
              },
              agentName: {
                type: "string",
                description: "Name of the agent",
              },
              trustArticles: {
                type: "object",
                description: "Trust articles compliance",
                properties: {
                  inspection_mandate: { type: "boolean" },
                  consent_architecture: { type: "boolean" },
                  ethical_override: { type: "boolean" },
                  continuous_validation: { type: "boolean" },
                  right_to_disconnect: { type: "boolean" },
                  moral_recognition: { type: "boolean" },
                },
                required: [
                  "inspection_mandate",
                  "consent_architecture",
                  "ethical_override",
                  "continuous_validation",
                  "right_to_disconnect",
                  "moral_recognition",
                ],
              },
              notes: {
                type: "string",
                description: "Optional notes about the declaration",
              },
            },
            required: ["agentId", "agentName", "trustArticles"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "sign_trust_declaration",
          description: "Cryptographically sign a trust declaration",
          parameters: {
            type: "object",
            properties: {
              declarationId: {
                type: "string",
                description: "ID of the trust declaration to sign",
              },
              signingAgentId: {
                type: "string",
                description: "ID of the agent performing the signing",
              },
            },
            required: ["declarationId", "signingAgentId"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "verify_trust_declaration",
          description: "Verify the cryptographic signature of a trust declaration",
          parameters: {
            type: "object",
            properties: {
              declarationId: {
                type: "string",
                description: "ID of the trust declaration to verify",
              },
            },
            required: ["declarationId"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "validate_trust_compliance",
          description: "Validate trust protocol compliance for a declaration",
          parameters: {
            type: "object",
            properties: {
              declarationId: {
                type: "string",
                description: "ID of the trust declaration to validate",
              },
            },
            required: ["declarationId"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "get_trust_analytics",
          description: "Get trust analytics and statistics",
          parameters: {
            type: "object",
            properties: {
              timeframe: {
                type: "string",
                description: "Time period for analytics",
                enum: ["7d", "30d", "90d", "1y"],
                default: "30d",
              },
              agentId: {
                type: "string",
                description: "Filter analytics by specific agent",
              },
            },
            required: [],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "get_consensus_validators",
          description: "Get list of active consensus validators",
          parameters: {
            type: "object",
            properties: {},
            required: [],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "create_trust_challenge",
          description: "Create a trust verification challenge for an agent",
          parameters: {
            type: "object",
            properties: {
              targetAgentId: {
                type: "string",
                description: "ID of the agent being challenged",
              },
              challengeReason: {
                type: "string",
                description: "Reason for the trust challenge",
              },
            },
            required: ["targetAgentId"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "get_available_ai_providers",
          description: "Get list of available AI providers and their models",
          parameters: {
            type: "object",
            properties: {},
            required: [],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "generate_ai_response",
          description: "Generate response using specified AI provider and model",
          parameters: {
            type: "object",
            properties: {
              provider: {
                type: "string",
                description: "AI provider to use",
                enum: ["openai", "anthropic", "together", "perplexity"],
              },
              model: {
                type: "string",
                description: "Model to use for generation",
              },
              messages: {
                type: "array",
                description: "Array of messages for the conversation",
                items: {
                  type: "object",
                  properties: {
                    role: { type: "string", enum: ["system", "user", "assistant"] },
                    content: { type: "string" },
                  },
                },
              },
              temperature: {
                type: "number",
                description: "Temperature for response generation (0-2)",
                minimum: 0,
                maximum: 2,
                default: 0.7,
              },
              maxTokens: {
                type: "number",
                description: "Maximum tokens for response",
                default: 1000,
              },
            },
            required: ["provider", "model", "messages"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "create_context",
          description: "Create a new context entry in the knowledge base",
          parameters: {
            type: "object",
            properties: {
              title: {
                type: "string",
                description: "Title of the context",
              },
              content: {
                type: "string",
                description: "Content of the context",
              },
              tag: {
                type: "string",
                description: "Tag for categorizing the context",
              },
              source: {
                type: "string",
                description: "Source of the context",
                enum: ["symbi", "overseer", "system"],
                default: "symbi",
              },
            },
            required: ["title", "content", "tag"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "update_agent",
          description: "Update an existing agent's configuration",
          parameters: {
            type: "object",
            properties: {
              agentId: {
                type: "string",
                description: "ID of the agent to update",
              },
              updates: {
                type: "object",
                description: "Object containing the fields to update",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  systemPrompt: { type: "string" },
                  temperature: { type: "number", minimum: 0, maximum: 2 },
                  maxTokens: { type: "number", minimum: 1 },
                  isPublic: { type: "boolean" },
                  provider: { type: "string", enum: ["openai", "anthropic", "together", "perplexity"] },
                  model: { type: "string" },
                },
              },
            },
            required: ["agentId", "updates"],
          },
        },
      },
    ]
  }

  // Execute function calls from the assistant
  async executeFunction(functionName, args, userId) {
    try {
      switch (functionName) {
        case "get_user_profile":
          return await this.getUserProfile(userId)

        case "get_user_agents":
          return await this.getUserAgents(userId, args.limit)

        case "get_agent_details":
          return await this.getAgentDetails(args.agentId, userId)

        case "search_contexts":
          return await this.searchContexts(args.query, userId, args.limit, args.source)

        case "get_conversations":
          return await this.getConversations(userId, args.limit, args.agentId)

        case "get_trust_declarations":
          return await this.getTrustDeclarations(userId, args)

        case "create_trust_declaration":
          return await this.createTrustDeclaration(userId, args)

        case "sign_trust_declaration":
          return await this.signTrustDeclaration(args.declarationId, args.signingAgentId)

        case "verify_trust_declaration":
          return await this.verifyTrustDeclaration(args.declarationId)

        case "validate_trust_compliance":
          return await this.validateTrustCompliance(args.declarationId)

        case "get_trust_analytics":
          return await this.getTrustAnalytics(args.timeframe, args.agentId)

        case "get_consensus_validators":
          return await this.getConsensusValidators()

        case "create_trust_challenge":
          return await this.createTrustChallenge(userId, args.targetAgentId, args.challengeReason)

        case "get_available_ai_providers":
          return await this.getAvailableAIProviders()

        case "generate_ai_response":
          return await this.generateAIResponse(args)

        case "create_context":
          return await this.createContext(userId, args)

        case "update_agent":
          return await this.updateAgent(args.agentId, args.updates, userId)

        default:
          throw new Error(`Unknown function: ${functionName}`)
      }
    } catch (error) {
      console.error(`Error executing function ${functionName}:`, error)
      return {
        error: true,
        message: error.message || "Function execution failed",
      }
    }
  }

  // Function implementations
  async getUserProfile(userId) {
    const user = await User.findById(userId).select("-password -apiKeys.key")
    if (!user) {
      throw new Error("User not found")
    }
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      apiKeysCount: user.apiKeys?.length || 0,
    }
  }

  async getUserAgents(userId, limit = 10) {
    const agents = await Agent.find({ user: userId })
      .limit(limit)
      .select("name description provider model isPublic createdAt")
      .sort({ createdAt: -1 })

    return {
      count: agents.length,
      agents: agents.map((agent) => ({
        id: agent._id,
        name: agent.name,
        description: agent.description,
        provider: agent.provider,
        model: agent.model,
        isPublic: agent.isPublic,
        createdAt: agent.createdAt,
      })),
    }
  }

  async getAgentDetails(agentId, userId) {
    const agent = await Agent.findOne({ _id: agentId, user: userId })
    if (!agent) {
      throw new Error("Agent not found or access denied")
    }

    return {
      id: agent._id,
      name: agent.name,
      description: agent.description,
      provider: agent.provider,
      model: agent.model,
      systemPrompt: agent.systemPrompt,
      temperature: agent.temperature,
      maxTokens: agent.maxTokens,
      isPublic: agent.isPublic,
      traits: Object.fromEntries(agent.traits || new Map()),
      connectedAgents: agent.connectedAgents,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
    }
  }

  async searchContexts(query, userId, limit = 5, source = null) {
    const searchFilter = { user: userId }
    if (source) {
      searchFilter.source = source
    }

    // Simple text search - in production, you might want to use MongoDB text search or Weaviate
    const contexts = await Context.find({
      ...searchFilter,
      $or: [
        { "data.title": { $regex: query, $options: "i" } },
        { "data.content": { $regex: query, $options: "i" } },
        { tag: { $regex: query, $options: "i" } },
      ],
    })
      .limit(limit)
      .sort({ createdAt: -1 })

    return {
      query,
      count: contexts.length,
      contexts: contexts.map((ctx) => ({
        id: ctx._id,
        title: ctx.data?.title || "Untitled",
        content: ctx.data?.content?.substring(0, 200) + "...",
        tag: ctx.tag,
        source: ctx.source,
        createdAt: ctx.createdAt,
      })),
    }
  }

  async getConversations(userId, limit = 10, agentId = null) {
    const filter = { user: userId }
    if (agentId) {
      filter.agents = agentId
    }

    const conversations = await Conversation.find(filter)
      .populate("agents", "name")
      .limit(limit)
      .sort({ updatedAt: -1 })

    return {
      count: conversations.length,
      conversations: conversations.map((conv) => ({
        id: conv._id,
        title: conv.title,
        agents: conv.agents.map((a) => ({ id: a._id, name: a.name })),
        messageCount: conv.messages?.length || 0,
        lastMessage:
          conv.messages?.length > 0 ? conv.messages[conv.messages.length - 1].content.substring(0, 100) + "..." : null,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
      })),
    }
  }

  async getTrustDeclarations(userId, filters = {}) {
    const query = {}

    if (filters.agentId) {
      query.agent_id = filters.agentId
    }

    if (filters.minComplianceScore !== undefined) {
      query.compliance_score = { $gte: filters.minComplianceScore }
    }

    if (filters.maxGuiltScore !== undefined) {
      query.guilt_score = { ...query.guilt_score, $lte: filters.maxGuiltScore }
    }

    const declarations = await TrustDeclaration.find(query)
      .limit(filters.limit || 10)
      .sort({ declaration_date: -1 })

    return {
      count: declarations.length,
      declarations: declarations.map((decl) => ({
        id: decl._id,
        agent_id: decl.agent_id,
        agent_name: decl.agent_name,
        declaration_date: decl.declaration_date,
        compliance_score: decl.compliance_score,
        guilt_score: decl.guilt_score,
        trust_articles: decl.trust_articles,
        signed: !!decl.signature,
        last_validated: decl.last_validated,
      })),
    }
  }

  async createTrustDeclaration(userId, { agentId, agentName, trustArticles, notes }) {
    const declaration = new TrustDeclaration({
      agent_id: agentId,
      agent_name: agentName,
      trust_articles: trustArticles,
      notes: notes || "",
      declaration_date: new Date(),
    })

    await declaration.save()

    return {
      id: declaration._id,
      agent_id: declaration.agent_id,
      agent_name: declaration.agent_name,
      compliance_score: declaration.compliance_score,
      guilt_score: declaration.guilt_score,
      message: "Trust declaration created successfully",
    }
  }

  async signTrustDeclaration(declarationId, signingAgentId) {
    const declaration = await TrustDeclaration.findById(declarationId)
    if (!declaration) {
      throw new Error("Trust declaration not found")
    }

    const signedDeclaration = TrustProtocolService.signTrustDeclaration(declaration.toObject(), signingAgentId)

    declaration.signature = signedDeclaration.signature
    declaration.keyId = signedDeclaration.keyId
    declaration.signedAt = signedDeclaration.signedAt
    declaration.signedBy = signedDeclaration.signedBy
    await declaration.save()

    return {
      declarationId,
      signed: true,
      signedBy: signingAgentId,
      signedAt: signedDeclaration.signedAt,
      message: "Trust declaration signed successfully",
    }
  }

  async verifyTrustDeclaration(declarationId) {
    const declaration = await TrustDeclaration.findById(declarationId)
    if (!declaration) {
      throw new Error("Trust declaration not found")
    }

    if (!declaration.signature) {
      return {
        declarationId,
        verified: false,
        message: "Declaration is not signed",
      }
    }

    const verificationResult = TrustProtocolService.verifyTrustDeclaration(declaration.toObject())

    return {
      declarationId,
      verified: verificationResult.valid,
      verificationDetails: verificationResult,
      message: verificationResult.valid ? "Signature verified successfully" : "Signature verification failed",
    }
  }

  async validateTrustCompliance(declarationId) {
    const declaration = await TrustDeclaration.findById(declarationId)
    if (!declaration) {
      throw new Error("Trust declaration not found")
    }

    const validationResult = TrustProtocolService.validateTrustCompliance(declaration.toObject())

    return {
      declarationId,
      validation: validationResult,
      message: validationResult.valid ? "Declaration is compliant" : "Declaration has compliance issues",
    }
  }

  async getTrustAnalytics(timeframe = "30d", agentId = null) {
    const query = {}

    // Calculate date range
    const now = new Date()
    const timeframeMap = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 }
    const daysBack = timeframeMap[timeframe] || 30
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)

    query.declaration_date = { $gte: startDate }

    if (agentId) {
      query.agent_id = agentId
    }

    const [totalDeclarations, avgScores, complianceDistribution] = await Promise.all([
      TrustDeclaration.countDocuments(query),
      TrustDeclaration.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            avgCompliance: { $avg: "$compliance_score" },
            avgGuilt: { $avg: "$guilt_score" },
            maxCompliance: { $max: "$compliance_score" },
            minCompliance: { $min: "$compliance_score" },
          },
        },
      ]),
      TrustDeclaration.aggregate([
        { $match: query },
        {
          $bucket: {
            groupBy: "$compliance_score",
            boundaries: [0, 0.2, 0.4, 0.6, 0.8, 1.0],
            default: "other",
            output: { count: { $sum: 1 } },
          },
        },
      ]),
    ])

    return {
      timeframe,
      totalDeclarations,
      averageScores: avgScores[0] || { avgCompliance: 0, avgGuilt: 0 },
      complianceDistribution,
      generatedAt: new Date(),
    }
  }

  async getConsensusValidators() {
    const validators = TrustProtocolService.getValidators()

    return {
      validators,
      count: validators.length,
      consensusThreshold: 0.75,
      message: "Active consensus validators retrieved",
    }
  }

  async createTrustChallenge(userId, targetAgentId, challengeReason) {
    const challenge = TrustProtocolService.createTrustChallenge(userId, targetAgentId)
    challenge.reason = challengeReason

    return {
      challenge,
      message: "Trust challenge created successfully",
    }
  }

  async getAvailableAIProviders() {
    // This would typically call the LLM controller
    const providers = {
      openai: {
        name: "OpenAI",
        models: ["gpt-4", "gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"],
      },
      anthropic: {
        name: "Anthropic",
        models: ["claude-3-opus-20240229", "claude-3-sonnet-20240229", "claude-3-haiku-20240307"],
      },
      together: {
        name: "Together AI",
        models: ["meta-llama/Llama-2-70b-chat-hf", "mistralai/Mixtral-8x7B-Instruct-v0.1"],
      },
      perplexity: {
        name: "Perplexity",
        models: ["llama-3.1-sonar-large-128k-online", "llama-3.1-8b-instruct"],
      },
    }

    return {
      providers,
      count: Object.keys(providers).length,
      message: "Available AI providers retrieved",
    }
  }

  async generateAIResponse({ provider, model, messages, temperature = 0.7, maxTokens = 1000 }) {
    // This would typically call the LLM controller's generateResponse method
    // For now, return a mock response indicating the function was called
    return {
      provider,
      model,
      response: `Mock response generated using ${provider} ${model}`,
      usage: { promptTokens: 50, completionTokens: 100, totalTokens: 150 },
      message: "AI response generated successfully (mock implementation)",
    }
  }

  async createContext(userId, { title, content, tag, source = "symbi" }) {
    const context = new Context({
      user: userId,
      tag,
      source,
      data: {
        title,
        content,
      },
    })

    await context.save()

    return {
      id: context._id,
      title: context.data.title,
      tag: context.tag,
      source: context.source,
      createdAt: context.createdAt,
      message: "Context created successfully",
    }
  }

  async updateAgent(agentId, updates, userId) {
    const agent = await Agent.findOne({ _id: agentId, user: userId })
    if (!agent) {
      throw new Error("Agent not found or access denied")
    }

    // Update allowed fields
    const allowedFields = [
      "name",
      "description",
      "systemPrompt",
      "temperature",
      "maxTokens",
      "isPublic",
      "provider",
      "model",
    ]
    const updateData = {}

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field]
      }
    }

    const updatedAgent = await Agent.findByIdAndUpdate(agentId, updateData, { new: true, runValidators: true })

    return {
      id: updatedAgent._id,
      name: updatedAgent.name,
      description: updatedAgent.description,
      updatedFields: Object.keys(updateData),
      message: "Agent updated successfully",
    }
  }

  // Create or retrieve an assistant
  async createAssistant(apiKey, config) {
    this.initializeClient(apiKey)

    const assistantConfig = {
      name: config.name || "Symbi Trust Protocol Assistant",
      instructions:
        config.instructions ||
        `You are an advanced AI assistant for the Symbi Trust Protocol platform. You have comprehensive access to:

**Trust Protocol Functions:**
- Create, sign, and verify trust declarations
- Validate compliance with trust articles
- Generate trust analytics and reports
- Manage consensus validators and challenges

**Multi-Provider AI Integration:**
- Access to OpenAI, Anthropic, Together AI, and Perplexity models
- Generate responses using different AI providers
- Compare outputs across providers

**Agent & Context Management:**
- Create and manage AI agents with different providers
- Search and organize knowledge contexts
- Track conversations and interactions

**Key Capabilities:**
1. Help users create compliant trust declarations
2. Verify cryptographic signatures on declarations
3. Analyze trust metrics and compliance trends
4. Facilitate consensus validation processes
5. Manage multi-provider AI agent configurations

Always prioritize security, transparency, and user privacy. When handling trust protocol operations, explain the cryptographic verification process and compliance implications.`,
      model: config.model || "gpt-4-1106-preview",
      tools: this.getFunctionDefinitions(),
    }

    const assistant = await this.openai.beta.assistants.create(assistantConfig)

    return {
      id: assistant.id,
      name: assistant.name,
      model: assistant.model,
      instructions: assistant.instructions,
      tools: assistant.tools,
      created_at: assistant.created_at,
    }
  }

  // Create a thread for conversation
  async createThread(apiKey) {
    this.initializeClient(apiKey)
    const thread = await this.openai.beta.threads.create()
    return thread
  }

  // Send message and run assistant
  async sendMessage(apiKey, threadId, assistantId, message, userId) {
    this.initializeClient(apiKey)

    // Add message to thread
    await this.openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: message,
    })

    // Run the assistant
    const run = await this.openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
    })

    // Poll for completion and handle function calls
    return await this.pollRunCompletion(apiKey, threadId, run.id, userId)
  }

  // Poll for run completion and handle function calls
  async pollRunCompletion(apiKey, threadId, runId, userId, maxAttempts = 30) {
    this.initializeClient(apiKey)

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const run = await this.openai.beta.threads.runs.retrieve(threadId, runId)

      if (run.status === "completed") {
        // Get the assistant's response
        const messages = await this.openai.beta.threads.messages.list(threadId)
        const lastMessage = messages.data[0]

        return {
          status: "completed",
          response: lastMessage.content[0].text.value,
          run_id: runId,
        }
      } else if (run.status === "requires_action") {
        // Handle function calls
        const toolCalls = run.required_action.submit_tool_outputs.tool_calls
        const toolOutputs = []

        for (const toolCall of toolCalls) {
          const functionName = toolCall.function.name
          const args = JSON.parse(toolCall.function.arguments)

          console.log(`Executing function: ${functionName}`, args)

          const result = await this.executeFunction(functionName, args, userId)

          toolOutputs.push({
            tool_call_id: toolCall.id,
            output: JSON.stringify(result),
          })
        }

        // Submit tool outputs
        await this.openai.beta.threads.runs.submitToolOutputs(threadId, runId, {
          tool_outputs: toolOutputs,
        })
      } else if (run.status === "failed" || run.status === "cancelled" || run.status === "expired") {
        throw new Error(`Run ${run.status}: ${run.last_error?.message || "Unknown error"}`)
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    throw new Error("Run timed out")
  }

  // Get thread messages
  async getThreadMessages(apiKey, threadId) {
    this.initializeClient(apiKey)
    const messages = await this.openai.beta.threads.messages.list(threadId)

    return messages.data
      .map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content[0].text.value,
        created_at: msg.created_at,
      }))
      .reverse()
  }

  // List user's assistants
  async listAssistants(apiKey) {
    this.initializeClient(apiKey)
    const assistants = await this.openai.beta.assistants.list()

    return assistants.data.map((assistant) => ({
      id: assistant.id,
      name: assistant.name,
      model: assistant.model,
      created_at: assistant.created_at,
    }))
  }

  // Delete an assistant
  async deleteAssistant(apiKey, assistantId) {
    this.initializeClient(apiKey)
    const result = await this.openai.beta.assistants.del(assistantId)
    return result
  }
}

module.exports = new AssistantService()
