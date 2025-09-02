const OpenAI = require('openai');
const User = require('../models/user.model');
const Agent = require('../models/agent.model');
const Context = require('../models/context.model');
const Conversation = require('../models/conversation.model');
const Trust = require('../models/trust.model');

class AssistantService {
  constructor() {
    this.openai = null;
    this.assistants = new Map(); // Cache for assistant instances
  }

  // Initialize OpenAI client with user's API key
  initializeClient(apiKey) {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }
    this.openai = new OpenAI({ apiKey });
    return this.openai;
  }

  // Function definitions for app data access
  getFunctionDefinitions() {
    return [
      {
        type: 'function',
        function: {
          name: 'get_user_profile',
          description: 'Get the current user\'s profile information',
          parameters: {
            type: 'object',
            properties: {},
            required: []
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'get_user_agents',
          description: 'Get all agents created by the user',
          parameters: {
            type: 'object',
            properties: {
              limit: {
                type: 'number',
                description: 'Maximum number of agents to return (default: 10)'
              }
            },
            required: []
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'get_agent_details',
          description: 'Get detailed information about a specific agent',
          parameters: {
            type: 'object',
            properties: {
              agentId: {
                type: 'string',
                description: 'The ID of the agent to retrieve'
              }
            },
            required: ['agentId']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'search_contexts',
          description: 'Search through user\'s contexts and knowledge base',
          parameters: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query to find relevant contexts'
              },
              limit: {
                type: 'number',
                description: 'Maximum number of results to return (default: 5)'
              },
              source: {
                type: 'string',
                description: 'Filter by context source (symbi, overseer, system)',
                enum: ['symbi', 'overseer', 'system']
              }
            },
            required: ['query']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'get_conversations',
          description: 'Get user\'s recent conversations',
          parameters: {
            type: 'object',
            properties: {
              limit: {
                type: 'number',
                description: 'Maximum number of conversations to return (default: 10)'
              },
              agentId: {
                type: 'string',
                description: 'Filter conversations by specific agent ID'
              }
            },
            required: []
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'get_trust_scores',
          description: 'Get trust scores and verification data',
          parameters: {
            type: 'object',
            properties: {
              targetType: {
                type: 'string',
                description: 'Type of entity to get trust scores for',
                enum: ['user', 'agent', 'context']
              },
              targetId: {
                type: 'string',
                description: 'ID of the specific entity (optional)'
              }
            },
            required: []
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'create_context',
          description: 'Create a new context entry in the knowledge base',
          parameters: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'Title of the context'
              },
              content: {
                type: 'string',
                description: 'Content of the context'
              },
              tag: {
                type: 'string',
                description: 'Tag for categorizing the context'
              },
              source: {
                type: 'string',
                description: 'Source of the context',
                enum: ['symbi', 'overseer', 'system'],
                default: 'symbi'
              }
            },
            required: ['title', 'content', 'tag']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'update_agent',
          description: 'Update an existing agent\'s configuration',
          parameters: {
            type: 'object',
            properties: {
              agentId: {
                type: 'string',
                description: 'ID of the agent to update'
              },
              updates: {
                type: 'object',
                description: 'Object containing the fields to update',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  systemPrompt: { type: 'string' },
                  temperature: { type: 'number', minimum: 0, maximum: 2 },
                  maxTokens: { type: 'number', minimum: 1 },
                  isPublic: { type: 'boolean' }
                }
              }
            },
            required: ['agentId', 'updates']
          }
        }
      }
    ];
  }

  // Execute function calls from the assistant
  async executeFunction(functionName, args, userId) {
    try {
      switch (functionName) {
        case 'get_user_profile':
          return await this.getUserProfile(userId);
        
        case 'get_user_agents':
          return await this.getUserAgents(userId, args.limit);
        
        case 'get_agent_details':
          return await this.getAgentDetails(args.agentId, userId);
        
        case 'search_contexts':
          return await this.searchContexts(args.query, userId, args.limit, args.source);
        
        case 'get_conversations':
          return await this.getConversations(userId, args.limit, args.agentId);
        
        case 'get_trust_scores':
          return await this.getTrustScores(userId, args.targetType, args.targetId);
        
        case 'create_context':
          return await this.createContext(userId, args);
        
        case 'update_agent':
          return await this.updateAgent(args.agentId, args.updates, userId);
        
        default:
          throw new Error(`Unknown function: ${functionName}`);
      }
    } catch (error) {
      console.error(`Error executing function ${functionName}:`, error);
      return {
        error: true,
        message: error.message || 'Function execution failed'
      };
    }
  }

  // Function implementations
  async getUserProfile(userId) {
    const user = await User.findById(userId).select('-password -apiKeys.key');
    if (!user) {
      throw new Error('User not found');
    }
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      apiKeysCount: user.apiKeys?.length || 0
    };
  }

  async getUserAgents(userId, limit = 10) {
    const agents = await Agent.find({ user: userId })
      .limit(limit)
      .select('name description provider model isPublic createdAt')
      .sort({ createdAt: -1 });
    
    return {
      count: agents.length,
      agents: agents.map(agent => ({
        id: agent._id,
        name: agent.name,
        description: agent.description,
        provider: agent.provider,
        model: agent.model,
        isPublic: agent.isPublic,
        createdAt: agent.createdAt
      }))
    };
  }

  async getAgentDetails(agentId, userId) {
    const agent = await Agent.findOne({ _id: agentId, user: userId });
    if (!agent) {
      throw new Error('Agent not found or access denied');
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
      updatedAt: agent.updatedAt
    };
  }

  async searchContexts(query, userId, limit = 5, source = null) {
    const searchFilter = { user: userId };
    if (source) {
      searchFilter.source = source;
    }
    
    // Simple text search - in production, you might want to use MongoDB text search or Weaviate
    const contexts = await Context.find({
      ...searchFilter,
      $or: [
        { 'data.title': { $regex: query, $options: 'i' } },
        { 'data.content': { $regex: query, $options: 'i' } },
        { tag: { $regex: query, $options: 'i' } }
      ]
    })
    .limit(limit)
    .sort({ createdAt: -1 });
    
    return {
      query,
      count: contexts.length,
      contexts: contexts.map(ctx => ({
        id: ctx._id,
        title: ctx.data?.title || 'Untitled',
        content: ctx.data?.content?.substring(0, 200) + '...',
        tag: ctx.tag,
        source: ctx.source,
        createdAt: ctx.createdAt
      }))
    };
  }

  async getConversations(userId, limit = 10, agentId = null) {
    const filter = { user: userId };
    if (agentId) {
      filter.agents = agentId;
    }
    
    const conversations = await Conversation.find(filter)
      .populate('agents', 'name')
      .limit(limit)
      .sort({ updatedAt: -1 });
    
    return {
      count: conversations.length,
      conversations: conversations.map(conv => ({
        id: conv._id,
        title: conv.title,
        agents: conv.agents.map(a => ({ id: a._id, name: a.name })),
        messageCount: conv.messages?.length || 0,
        lastMessage: conv.messages?.length > 0 ? 
          conv.messages[conv.messages.length - 1].content.substring(0, 100) + '...' : null,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt
      }))
    };
  }

  async getTrustScores(userId, targetType = null, targetId = null) {
    const filter = { user: userId };
    if (targetType) {
      filter.targetType = targetType;
    }
    if (targetId) {
      filter.targetId = targetId;
    }
    
    const trustScores = await Trust.find(filter)
      .sort({ createdAt: -1 })
      .limit(20);
    
    return {
      count: trustScores.length,
      trustScores: trustScores.map(trust => ({
        id: trust._id,
        targetType: trust.targetType,
        targetId: trust.targetId,
        score: trust.score,
        verificationMethod: trust.verificationMethod,
        metadata: trust.metadata,
        createdAt: trust.createdAt
      }))
    };
  }

  async createContext(userId, { title, content, tag, source = 'symbi' }) {
    const context = new Context({
      user: userId,
      tag,
      source,
      data: {
        title,
        content
      }
    });
    
    await context.save();
    
    return {
      id: context._id,
      title: context.data.title,
      tag: context.tag,
      source: context.source,
      createdAt: context.createdAt,
      message: 'Context created successfully'
    };
  }

  async updateAgent(agentId, updates, userId) {
    const agent = await Agent.findOne({ _id: agentId, user: userId });
    if (!agent) {
      throw new Error('Agent not found or access denied');
    }
    
    // Update allowed fields
    const allowedFields = ['name', 'description', 'systemPrompt', 'temperature', 'maxTokens', 'isPublic'];
    const updateData = {};
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    }
    
    const updatedAgent = await Agent.findByIdAndUpdate(
      agentId,
      updateData,
      { new: true, runValidators: true }
    );
    
    return {
      id: updatedAgent._id,
      name: updatedAgent.name,
      description: updatedAgent.description,
      updatedFields: Object.keys(updateData),
      message: 'Agent updated successfully'
    };
  }

  // Create or retrieve an assistant
  async createAssistant(apiKey, config) {
    this.initializeClient(apiKey);
    
    const assistantConfig = {
      name: config.name || 'Symbi App Assistant',
      instructions: config.instructions || `You are a helpful assistant that can access and manage data in the Symbi Trust Protocol application. You have access to user profiles, agents, contexts, conversations, and trust scores. Use the available functions to help users interact with their data effectively.

When users ask about their data, use the appropriate functions to retrieve and present the information clearly. You can help with:
- Viewing and managing agents
- Searching through contexts and knowledge base
- Reviewing conversations and trust scores
- Creating new contexts
- Updating agent configurations

Always be helpful, accurate, and respect user privacy.`,
      model: config.model || 'gpt-4o',
      tools: (Array.isArray(config.tools) && config.tools.length > 0)
        ? config.tools
        : this.getFunctionDefinitions()
    };
    
    const assistant = await this.openai.beta.assistants.create(assistantConfig);
    
    return {
      id: assistant.id,
      name: assistant.name,
      model: assistant.model,
      instructions: assistant.instructions,
      tools: assistant.tools,
      created_at: assistant.created_at
    };
  }

  // Create a thread for conversation
  async createThread(apiKey) {
    this.initializeClient(apiKey);
    const thread = await this.openai.beta.threads.create();
    return thread;
  }

  // Send message and run assistant
  async sendMessage(apiKey, threadId, assistantId, message, userId) {
    this.initializeClient(apiKey);
    
    // Add message to thread
    await this.openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: message
    });
    
    // Run the assistant
    const run = await this.openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId
    });
    
    // Poll for completion and handle function calls
    return await this.pollRunCompletion(apiKey, threadId, run.id, userId);
  }

  // Poll for run completion and handle function calls
  async pollRunCompletion(apiKey, threadId, runId, userId, maxAttempts = 30) {
    this.initializeClient(apiKey);
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const run = await this.openai.beta.threads.runs.retrieve(threadId, runId);
      
      if (run.status === 'completed') {
        // Get the assistant's response
        const messages = await this.openai.beta.threads.messages.list(threadId);
        const lastMessage = messages.data[0];
        
        return {
          status: 'completed',
          response: lastMessage.content[0].text.value,
          run_id: runId
        };
      } else if (run.status === 'requires_action') {
        // Handle function calls
        const toolCalls = run.required_action.submit_tool_outputs.tool_calls;
        const toolOutputs = [];
        
        for (const toolCall of toolCalls) {
          const functionName = toolCall.function.name;
          const args = JSON.parse(toolCall.function.arguments);
          
          console.log(`Executing function: ${functionName}`, args);
          
          const result = await this.executeFunction(functionName, args, userId);
          
          toolOutputs.push({
            tool_call_id: toolCall.id,
            output: JSON.stringify(result)
          });
        }
        
        // Submit tool outputs
        await this.openai.beta.threads.runs.submitToolOutputs(threadId, runId, {
          tool_outputs: toolOutputs
        });
        
      } else if (run.status === 'failed' || run.status === 'cancelled' || run.status === 'expired') {
        throw new Error(`Run ${run.status}: ${run.last_error?.message || 'Unknown error'}`);
      }
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    throw new Error('Run timed out');
  }

  // Get thread messages
  async getThreadMessages(apiKey, threadId) {
    this.initializeClient(apiKey);
    const messages = await this.openai.beta.threads.messages.list(threadId);
    
    return messages.data.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content[0].text.value,
      created_at: msg.created_at
    })).reverse();
  }

  // List user's assistants
  async listAssistants(apiKey) {
    this.initializeClient(apiKey);
    const assistants = await this.openai.beta.assistants.list();
    const list = assistants.data.map(assistant => ({
      id: assistant.id,
      name: assistant.name,
      model: assistant.model,
      created_at: assistant.created_at
    }));
    return list.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
  }

  // Delete an assistant
  async deleteAssistant(apiKey, assistantId) {
    this.initializeClient(apiKey);
    const result = await this.openai.beta.assistants.del(assistantId);
    return result;
  }

  // Update an assistant configuration
  async updateAssistant(apiKey, assistantId, update) {
    this.initializeClient(apiKey);
    const payload = {};
    if (update.name) payload.name = update.name;
    if (update.instructions) payload.instructions = update.instructions;
    if (update.model) payload.model = update.model;
    if (Array.isArray(update.tools)) payload.tools = update.tools;
    const assistant = await this.openai.beta.assistants.update(assistantId, payload);
    return {
      id: assistant.id,
      name: assistant.name,
      model: assistant.model,
      instructions: assistant.instructions,
      tools: assistant.tools,
      updated_at: assistant.updated_at
    };
  }

  // Get most recent assistant
  async getLatestAssistant(apiKey) {
    const list = await this.listAssistants(apiKey);
    return list[0] || null;
  }
}

module.exports = new AssistantService();
