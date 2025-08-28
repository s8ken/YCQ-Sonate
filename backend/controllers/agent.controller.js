const Agent = require('../models/agent.model');
const User = require('../models/user.model');
const asyncHandler = require('express-async-handler');

// @desc    Get all agents for user
// @route   GET /api/agents
// @access  Private
const getAllAgents = asyncHandler(async (req, res) => {
  const agents = await Agent.find({ user: req.user.id })
    .populate('connectedAgents', 'name description')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: agents.length,
    data: agents
  });
});

// @desc    Get all public agents
// @route   GET /api/agents/public
// @access  Private
const getPublicAgents = asyncHandler(async (req, res) => {
  const agents = await Agent.find({ isPublic: true })
    .populate('user', 'name')
    .populate('connectedAgents', 'name description')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: agents.length,
    data: agents
  });
});

// @desc    Get single agent
// @route   GET /api/agents/:id
// @access  Private
const getAgent = asyncHandler(async (req, res) => {
  const agent = await Agent.findById(req.params.id)
    .populate('connectedAgents', 'name description')
    .populate('user', 'name email');

  if (!agent) {
    return res.status(404).json({
      success: false,
      message: 'Agent not found'
    });
  }

  // Check ownership
  if (agent.user._id.toString() !== req.user.id && !agent.isPublic) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this agent'
    });
  }

  res.status(200).json({
    success: true,
    data: agent
  });
});

// @desc    Create new agent
// @route   POST /api/agents
// @access  Private
const createAgent = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    provider,
    model,
    apiKeyId,
    systemPrompt,
    temperature,
    maxTokens,
    isPublic,
    traits,
    ciModel
  } = req.body;

  // Verify API key belongs to user
  const user = await User.findById(req.user.id);
  const apiKey = user.apiKeys.id(apiKeyId);
  
  if (!apiKey) {
    return res.status(400).json({
      success: false,
      message: 'Invalid API key'
    });
  }

  const agent = await Agent.create({
    name,
    description,
    user: req.user.id,
    provider,
    model,
    apiKeyId,
    systemPrompt,
    temperature,
    maxTokens,
    isPublic,
    traits,
    ciModel
  });

  res.status(201).json({
    success: true,
    data: agent
  });
});

// @desc    Update agent
// @route   PUT /api/agents/:id
// @access  Private
const updateAgent = asyncHandler(async (req, res) => {
  let agent = await Agent.findById(req.params.id);

  if (!agent) {
    return res.status(404).json({
      success: false,
      message: 'Agent not found'
    });
  }

  // Check ownership
  if (agent.user.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this agent'
    });
  }

  agent = await Agent.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: agent
  });
});

// @desc    Delete agent
// @route   DELETE /api/agents/:id
// @access  Private
const deleteAgent = asyncHandler(async (req, res) => {
  const agent = await Agent.findById(req.params.id);

  if (!agent) {
    return res.status(404).json({
      success: false,
      message: 'Agent not found'
    });
  }

  // Check ownership
  if (agent.user.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this agent'
    });
  }

  await agent.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Agent deleted successfully'
  });
});

// @desc    Connect agents
// @route   POST /api/agents/connect
// @access  Private
const connectAgents = asyncHandler(async (req, res) => {
  const { agentId, targetAgentId } = req.body;

  const agent = await Agent.findById(agentId);
  const targetAgent = await Agent.findById(targetAgentId);

  if (!agent || !targetAgent) {
    return res.status(404).json({
      success: false,
      message: 'One or both agents not found'
    });
  }

  // Check ownership of source agent
  if (agent.user.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to modify this agent'
    });
  }

  // Check if target agent is public or owned by user
  if (targetAgent.user.toString() !== req.user.id && !targetAgent.isPublic) {
    return res.status(403).json({
      success: false,
      message: 'Target agent is not accessible'
    });
  }

  // Add connection if not already connected
  if (!agent.connectedAgents.includes(targetAgentId)) {
    agent.connectedAgents.push(targetAgentId);
    await agent.save();
  }

  res.status(200).json({
    success: true,
    message: 'Agents connected successfully',
    data: agent
  });
});

// @desc    Add external system to agent
// @route   POST /api/agents/:id/external-systems
// @access  Private
const addExternalSystem = asyncHandler(async (req, res) => {
  const agent = await Agent.findById(req.params.id);

  if (!agent) {
    return res.status(404).json({
      success: false,
      message: 'Agent not found'
    });
  }

  // Check ownership
  if (agent.user.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to modify this agent'
    });
  }

  const { name, type, endpoint, apiKey, config } = req.body;

  // Validate required fields
  if (!name || !type || !endpoint) {
    return res.status(400).json({
      success: false,
      message: 'Name, type, and endpoint are required'
    });
  }

  // Check if external system with same name already exists
  const existingSystem = agent.externalSystems.find(sys => sys.name === name);
  if (existingSystem) {
    return res.status(400).json({
      success: false,
      message: 'External system with this name already exists'
    });
  }

  await agent.addExternalSystem({
    name,
    type,
    endpoint,
    apiKey,
    config
  });

  res.status(201).json({
    success: true,
    message: 'External system added successfully',
    data: agent
  });
});

// @desc    Update external system status
// @route   PUT /api/agents/:id/external-systems/:systemName/toggle
// @access  Private
const toggleExternalSystem = asyncHandler(async (req, res) => {
  const agent = await Agent.findById(req.params.id);

  if (!agent) {
    return res.status(404).json({
      success: false,
      message: 'Agent not found'
    });
  }

  // Check ownership
  if (agent.user.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to modify this agent'
    });
  }

  const { isActive } = req.body;
  await agent.toggleExternalSystem(req.params.systemName, isActive);

  res.status(200).json({
    success: true,
    message: 'External system status updated',
    data: agent
  });
});

// @desc    Sync with external system
// @route   POST /api/agents/:id/external-systems/:systemName/sync
// @access  Private
const syncExternalSystem = asyncHandler(async (req, res) => {
  const agent = await Agent.findById(req.params.id);

  if (!agent) {
    return res.status(404).json({
      success: false,
      message: 'Agent not found'
    });
  }

  // Check ownership
  if (agent.user.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to modify this agent'
    });
  }

  const systemName = req.params.systemName;
  const system = agent.externalSystems.find(sys => sys.name === systemName);

  if (!system) {
    return res.status(404).json({
      success: false,
      message: 'External system not found'
    });
  }

  if (!system.isActive) {
    return res.status(400).json({
      success: false,
      message: 'External system is not active'
    });
  }

  // Update sync timestamp
  await agent.updateExternalSystemSync(systemName);

  // Here you would implement the actual sync logic based on system type
  // For now, we'll just return success
  res.status(200).json({
    success: true,
    message: `Synced with ${systemName} successfully`,
    data: {
      systemName,
      lastSync: new Date(),
      status: 'synced'
    }
  });
});

module.exports = {
  getAllAgents,
  getPublicAgents,
  getAgent,
  createAgent,
  updateAgent,
  deleteAgent,
  connectAgents,
  addExternalSystem,
  toggleExternalSystem,
  syncExternalSystem
};