const asyncHandler = require('express-async-handler');
const Context = require('../models/context.model');
const weaviateService = require('../services/weaviate.service');

// @desc    Get all contexts with pagination and filtering
// @route   GET /api/context
// @access  Private
const getAllContexts = asyncHandler(async (req, res) => {
  const { tag, source, page = 1, limit = 10, active } = req.query;
  const query = {};
  
  if (tag) query.tag = tag;
  if (source) query.source = source;
  if (active !== undefined) query.isActive = active === 'true';
  
  const options = {
    sort: { createdAt: -1 },
    skip: (page - 1) * limit,
    limit: parseInt(limit),
  };
  
  const contexts = await Context.find(query, null, options);
  const total = await Context.countDocuments(query);
  
  res.json({
    contexts,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total,
  });
});

// @desc    Get active contexts by tag
// @route   GET /api/context/tag/:tag
// @access  Private
const getActiveContextsByTag = asyncHandler(async (req, res) => {
  const contexts = await Context.getActiveByTag(req.params.tag);
  res.json(contexts);
});

// @desc    Get a specific context by ID
// @route   GET /api/context/:id
// @access  Private
const getContextById = asyncHandler(async (req, res) => {
  const context = await Context.findById(req.params.id);
  
  if (!context) {
    res.status(404);
    throw new Error('Context not found');
  }
  
  res.json(context);
});

// @desc    Create a new context
// @route   POST /api/context
// @access  Private
const createContext = asyncHandler(async (req, res) => {
  const { tag, source, data, relatedTo, metadata, trustScore, expiresAt } = req.body;
  
  const context = new Context({
    tag,
    source,
    data,
    relatedTo: relatedTo || {},
    metadata: metadata || {},
    trustScore: trustScore || 5,
    expiresAt: expiresAt || null,
  });
  
  const createdContext = await context.save();
  // Weaviate sync happens automatically via post-save middleware
  res.status(201).json(createdContext);
});

// @desc    Create a context bridge
// @route   POST /api/context/bridge
// @access  Private
const createContextBridge = asyncHandler(async (req, res) => {
  if (process.env.OVERSEER_ENABLED !== 'true') {
    return res.status(501).json({ success: false, message: 'Not implemented in POC' });
  }
  const { fromTag, toTag, data } = req.body;
  
  if (!fromTag || !toTag || !data) {
    res.status(400);
    throw new Error('Missing required fields');
  }
  
  const bridgeContext = await Context.createBridge(fromTag, toTag, data);
  // Weaviate sync happens automatically in createBridge method
  res.status(201).json(bridgeContext);
});

// @desc    Update a context
// @route   PUT /api/context/:id
// @access  Private
const updateContext = asyncHandler(async (req, res) => {
  const { data, metadata, trustScore, isActive } = req.body;
  
  const context = await Context.findById(req.params.id);
  
  if (!context) {
    res.status(404);
    throw new Error('Context not found');
  }
  
  if (data) context.data = data;
  if (metadata) context.metadata = metadata;
  if (trustScore !== undefined) context.trustScore = trustScore;
  if (isActive !== undefined) context.isActive = isActive;
  
  const updatedContext = await context.save();
  // Sync updated context to Weaviate
  await updatedContext.syncToWeaviate();
  
  res.json(updatedContext);
});

// @desc    Deactivate a context
// @route   PUT /api/context/:id/deactivate
// @access  Private
const deactivateContext = asyncHandler(async (req, res) => {
  const context = await Context.findById(req.params.id);
  
  if (!context) {
    res.status(404);
    throw new Error('Context not found');
  }
  
  await context.deactivate();
  res.json(context);
});

// @desc    Delete a context
// @route   DELETE /api/context/:id
// @access  Private (admin)
const deleteContext = asyncHandler(async (req, res) => {
  const context = await Context.findById(req.params.id);
  
  if (!context) {
    res.status(404);
    throw new Error('Context not found');
  }
  
  // Remove from Weaviate before deleting from MongoDB
  await context.removeFromWeaviate();
  await context.remove();
  res.json({ message: 'Context deleted' });
});

// @desc    Semantic search using Weaviate
// @route   GET /api/context/search
// @access  Private
const semanticSearch = asyncHandler(async (req, res) => {
  const { query, limit = 10, threshold = 0.7 } = req.query;
  
  if (!query) {
    res.status(400);
    throw new Error('Query parameter is required');
  }
  
  const results = await Context.semanticSearch(query, {
    limit: parseInt(limit),
    threshold: parseFloat(threshold)
  });
  
  res.json({
    query,
    results,
    count: results.length
  });
});

// @desc    Get bridge recommendations
// @route   GET /api/context/recommendations
// @access  Private
const getBridgeRecommendations = asyncHandler(async (req, res) => {
  const { sourceTag, limit = 5 } = req.query;
  
  if (!sourceTag) {
    res.status(400);
    throw new Error('sourceTag parameter is required');
  }
  
  const recommendations = await Context.getBridgeRecommendations(sourceTag, parseInt(limit));
  
  res.json({
    sourceTag,
    recommendations,
    count: recommendations.length
  });
});

// @desc    Get Weaviate connection status
// @route   GET /api/context/weaviate/status
// @access  Private
const getWeaviateStatus = asyncHandler(async (req, res) => {
  const status = {
    connected: weaviateService.isConnected,
    url: process.env.WEAVIATE_URL || 'Not configured',
    schemaExists: false
  };
  
  if (weaviateService.isConnected) {
    try {
      status.schemaExists = await weaviateService.checkSchema();
    } catch (error) {
      status.error = error.message;
    }
  }
  
  res.json(status);
});

// @desc    Initialize Weaviate schema
// @route   POST /api/context/weaviate/init
// @access  Private
const initializeWeaviate = asyncHandler(async (req, res) => {
  await weaviateService.initializeSchema();
  res.json({ message: 'Weaviate schema initialized successfully' });
});

// @desc    Sync existing contexts to Weaviate
// @route   POST /api/context/weaviate/sync
// @access  Private
const syncContextsToWeaviate = asyncHandler(async (req, res) => {
  const { limit = 100 } = req.query;
  
  const contexts = await Context.find({ vectorized: { $ne: true } })
    .limit(parseInt(limit))
    .exec();
  
  let syncedCount = 0;
  let errorCount = 0;
  
  for (const context of contexts) {
    try {
      await context.syncToWeaviate();
      syncedCount++;
    } catch (error) {
      console.error(`Failed to sync context ${context._id}:`, error.message);
      errorCount++;
    }
  }
  
  res.json({
    message: 'Context sync completed',
    totalProcessed: contexts.length,
    synced: syncedCount,
    errors: errorCount
  });
});

module.exports = {
  getAllContexts,
  getActiveContextsByTag,
  getContextById,
  createContext,
  createContextBridge,
  updateContext,
  deactivateContext,
  deleteContext,
  semanticSearch,
  getBridgeRecommendations,
  getWeaviateStatus,
  initializeWeaviate,
  syncContextsToWeaviate,
};
