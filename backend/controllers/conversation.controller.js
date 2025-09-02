const asyncHandler = require("express-async-handler")
const Conversation = require("../models/conversation.model")
const Agent = require("../models/agent.model")
const User = require("../models/user.model")
const axios = require("axios")
const OpenAI = require("openai")
const { getSocketIO } = require("../utils/socket")

// @desc    Get all conversations for user
// @route   GET /api/conversations
// @access  Private
const getAllConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ user: req.user.id })
    .populate("agents", "name description")
    .sort({ updatedAt: -1 })

  res.json({
    success: true,
    count: conversations.length,
    data: conversations,
  })
})

// @desc    Get single conversation
// @route   GET /api/conversations/:id
// @access  Private
const getConversation = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id)
    .populate("agents", "name description")
    .populate("user", "name email")

  if (!conversation) {
    res.status(404)
    throw new Error("Conversation not found")
  }

  // Check if user owns this conversation
  if (conversation.user._id.toString() !== req.user.id) {
    res.status(403)
    throw new Error("Not authorized to access this conversation")
  }

  res.json({
    success: true,
    data: conversation,
  })
})

// @desc    Create new conversation
// @route   POST /api/conversations
// @access  Private
const createConversation = asyncHandler(async (req, res) => {
  const { title, agent, initialMessage } = req.body

  if (!title) {
    res.status(400)
    throw new Error("Please provide title")
  }

  const conversation = await Conversation.create({
    title,
    agents: agent ? [agent] : [], // Convert single agent to array
    user: req.user.id,
    messages: initialMessage
      ? [
          {
            role: "user",
            content: initialMessage,
            timestamp: new Date(),
          },
        ]
      : [],
  })

  const populatedConversation = await Conversation.findById(conversation._id)
    .populate("agents", "name description")
    .populate("user", "name email")

  res.status(201).json({
    success: true,
    data: populatedConversation,
  })
})

// @desc    Update conversation
// @route   PUT /api/conversations/:id
// @access  Private
const updateConversation = asyncHandler(async (req, res) => {
  let conversation = await Conversation.findById(req.params.id)

  if (!conversation) {
    res.status(404)
    throw new Error("Conversation not found")
  }

  // Check if user owns this conversation
  if (conversation.user.toString() !== req.user.id) {
    res.status(403)
    throw new Error("Not authorized to update this conversation")
  }

  conversation = await Conversation.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updatedAt: new Date() },
    { new: true, runValidators: true },
  ).populate("agents", "name description")

  res.json({
    success: true,
    data: conversation,
  })
})

// @desc    Delete conversation
// @route   DELETE /api/conversations/:id
// @access  Private
const deleteConversation = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id)

  if (!conversation) {
    res.status(404)
    throw new Error("Conversation not found")
  }

  // Check if user owns this conversation
  if (conversation.user.toString() !== req.user.id) {
    res.status(403)
    throw new Error("Not authorized to delete this conversation")
  }

  await Conversation.findByIdAndDelete(req.params.id)

  res.json({
    success: true,
    message: "Conversation deleted successfully",
  })
})

// @desc    Get messages from conversation
// @route   GET /api/conversations/:id/messages
// @access  Private
const getMessages = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id)

  if (!conversation) {
    res.status(404)
    throw new Error("Conversation not found")
  }

  // Check if user owns this conversation
  if (conversation.user.toString() !== req.user.id) {
    res.status(403)
    throw new Error("Not authorized to access this conversation")
  }

  res.json({
    success: true,
    count: conversation.messages.length,
    data: conversation.messages,
  })
})

// @desc    Add message to conversation
// @route   POST /api/conversations/:id/messages
// @access  Private
const addMessage = asyncHandler(async (req, res) => {
  const { sender, content, agentId } = req.body

  if (!sender || !content) {
    res.status(400)
    throw new Error("Please provide sender and content")
  }

  const conversation = await Conversation.findById(req.params.id)

  if (!conversation) {
    res.status(404)
    throw new Error("Conversation not found")
  }

  // Check if user owns this conversation
  if (conversation.user.toString() !== req.user.id) {
    res.status(403)
    throw new Error("Not authorized to add message to this conversation")
  }

  const newMessage = {
    sender,
    content,
    agentId: agentId || null,
    timestamp: new Date(),
  }

  conversation.messages.push(newMessage)
  conversation.updatedAt = new Date()
  await conversation.save()

  // Emit the new message to all clients in the conversation room
  getSocketIO().to(req.params.id).emit("newMessage", newMessage)

  // Generate agent response if user message and agent is selected
  if (sender === "user" && agentId) {
    try {
      const agentMessage = await generateAgentResponse(conversation, agentId, req.user.id)
      // Emit the agent response as well
      if (agentMessage) {
        getSocketIO().to(req.params.id).emit("newMessage", agentMessage)
      }
    } catch (error) {
      console.error("Error generating agent response:", error.message)

      // Add error message to conversation for user visibility
      const errorMessage = {
        sender: "system",
        content: `Error generating agent response: ${error.message}. Please check your agent configuration and API keys.`,
        timestamp: new Date(),
      }

      conversation.messages.push(errorMessage)
      await conversation.save()

      // Emit the error message as well
      getSocketIO().to(req.params.id).emit("newMessage", errorMessage)
    }
  }

  res.status(201).json({
    success: true,
    data: newMessage,
  })
})

// Helper function to generate agent response
const generateAgentResponse = async (conversation, agentId, userId) => {
  try {
    // Get agent details
    const agent = await Agent.findById(agentId)
    if (!agent) {
      throw new Error("Agent not found")
    }

    // Get user with API keys
    const user = await User.findById(userId)
    if (!user) {
      throw new Error("User not found")
    }

    // Get the API key for the agent
    const apiKey = user.apiKeys.id(agent.apiKeyId)
    if (!apiKey) {
      throw new Error(
        `API key not found for agent "${agent.name}". Please configure a valid API key in agent settings.`,
      )
    }
    if (!apiKey.isActive) {
      throw new Error(`API key for agent "${agent.name}" is inactive. Please activate the API key in your settings.`)
    }
    if (!apiKey.key) {
      throw new Error(`API key for agent "${agent.name}" is missing the key value. Please reconfigure the API key.`)
    }

    // Prepare conversation history for LLM
    const messages = [
      {
        role: "system",
        content:
          agent.systemPrompt ||
          "You are a helpful AI assistant. You must never identify yourself as GPT-3 or any specific model version. Always respond as a general AI assistant without mentioning your underlying model. Focus on being helpful, accurate, and safe in your responses.",
      },
    ]

    // Add recent conversation history (last 10 messages)
    const recentMessages = conversation.messages.slice(-10)
    for (const msg of recentMessages) {
      messages.push({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.content,
      })
    }

    let responseContent = ""

    // Generate response based on provider
    if (agent.provider === "openai") {
      try {
        const openai = new OpenAI({ apiKey: apiKey.key })
        const completion = await openai.chat.completions.create({
          model: agent.model || "gpt-4o",
          messages: messages,
          temperature: agent.temperature || 0.7,
          max_tokens: agent.maxTokens || 1000,
        })

        if (!completion.choices || completion.choices.length === 0) {
          throw new Error("No response generated from OpenAI")
        }

        responseContent = completion.choices[0].message.content
      } catch (error) {
        if (error.status === 401) {
          throw new Error(`Invalid OpenAI API key for agent "${agent.name}". Please check your API key.`)
        } else if (error.status === 429) {
          throw new Error(`OpenAI rate limit exceeded for agent "${agent.name}". Please try again later.`)
        } else if (error.status === 400) {
          throw new Error(`Invalid request to OpenAI for agent "${agent.name}". Please check agent configuration.`)
        } else {
          throw new Error(`OpenAI API error for agent "${agent.name}": ${error.message}`)
        }
      }
    } else if (agent.provider === "anthropic") {
      try {
        const response = await axios.post(
          "https://api.anthropic.com/v1/messages",
          {
            model: agent.model || "claude-3-sonnet-20240229",
            max_tokens: agent.maxTokens || 1000,
            temperature: agent.temperature || 0.7,
            system: agent.systemPrompt || "You are a helpful AI assistant.",
            messages: messages.filter((msg) => msg.role !== "system"),
          },
          {
            headers: {
              "Content-Type": "application/json",
              "x-api-key": apiKey.key,
              "anthropic-version": "2023-06-01",
            },
          },
        )

        if (!response.data.content || response.data.content.length === 0) {
          throw new Error("No response generated from Anthropic")
        }

        responseContent = response.data.content[0].text
      } catch (error) {
        if (error.response?.status === 401) {
          throw new Error(`Invalid Anthropic API key for agent "${agent.name}". Please check your API key.`)
        } else if (error.response?.status === 429) {
          throw new Error(`Anthropic rate limit exceeded for agent "${agent.name}". Please try again later.`)
        } else if (error.response?.status === 400) {
          throw new Error(`Invalid request to Anthropic for agent "${agent.name}". Please check agent configuration.`)
        } else {
          throw new Error(`Anthropic API error for agent "${agent.name}": ${error.message}`)
        }
      }
    } else if (agent.provider === "together") {
      try {
        const response = await axios.post(
          "https://api.together.xyz/v1/chat/completions",
          {
            model: agent.model || "meta-llama/Llama-2-70b-chat-hf",
            messages: messages,
            temperature: agent.temperature || 0.7,
            max_tokens: agent.maxTokens || 1000,
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey.key}`,
              "Content-Type": "application/json",
            },
          },
        )

        if (!response.data.choices || response.data.choices.length === 0) {
          throw new Error("No response generated from Together AI")
        }

        responseContent = response.data.choices[0].message.content
      } catch (error) {
        if (error.response?.status === 401) {
          throw new Error(`Invalid Together AI API key for agent "${agent.name}". Please check your API key.`)
        } else if (error.response?.status === 429) {
          throw new Error(`Together AI rate limit exceeded for agent "${agent.name}". Please try again later.`)
        } else if (error.response?.status === 400) {
          throw new Error(`Invalid request to Together AI for agent "${agent.name}". Please check agent configuration.`)
        } else {
          throw new Error(`Together AI API error for agent "${agent.name}": ${error.message}`)
        }
      }
    } else if (agent.provider === "perplexity") {
      try {
        const response = await axios.post(
          "https://api.perplexity.ai/chat/completions",
          {
            model: agent.model || "llama-3.1-sonar-large-128k-online",
            messages: messages,
            temperature: agent.temperature || 0.7,
            max_tokens: agent.maxTokens || 1000,
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey.key}`,
              "Content-Type": "application/json",
            },
          },
        )

        if (!response.data.choices || response.data.choices.length === 0) {
          throw new Error("No response generated from Perplexity")
        }

        responseContent = response.data.choices[0].message.content
      } catch (error) {
        if (error.response?.status === 401) {
          throw new Error(`Invalid Perplexity API key for agent "${agent.name}". Please check your API key.`)
        } else if (error.response?.status === 429) {
          throw new Error(`Perplexity rate limit exceeded for agent "${agent.name}". Please try again later.`)
        } else if (error.response?.status === 400) {
          throw new Error(`Invalid request to Perplexity for agent "${agent.name}". Please check agent configuration.`)
        } else {
          throw new Error(`Perplexity API error for agent "${agent.name}": ${error.message}`)
        }
      }
    } else {
      throw new Error(
        `Provider "${agent.provider}" is not supported. Please use OpenAI, Anthropic, Together AI, or Perplexity.`,
      )
    }

    // Add agent response to conversation
    const agentMessage = {
      sender: "ai",
      content: responseContent,
      agentId: agentId,
      timestamp: new Date(),
    }

    conversation.messages.push(agentMessage)
    conversation.updatedAt = new Date()
    await conversation.save()

    return agentMessage
  } catch (error) {
    console.error("Error in generateAgentResponse:", error)
    throw error
  }
}

module.exports = {
  getAllConversations,
  getConversation,
  createConversation,
  updateConversation,
  deleteConversation,
  getMessages,
  addMessage,
}
