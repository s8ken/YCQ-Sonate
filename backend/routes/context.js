const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
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
} = require('../controllers/context.controller');

// Get all contexts with pagination and filtering
router.get('/', protect, getAllContexts);

// Get active contexts by tag
router.get('/tag/:tag', protect, getActiveContextsByTag);

// Get a specific context by ID
router.get('/:id', protect, getContextById);

// Create a new context
router.post('/', protect, createContext);

// Create a context bridge
router.post('/bridge', protect, createContextBridge);

// Semantic search routes
router.post('/search', protect, semanticSearch);

// Bridge recommendations
router.post('/recommendations', protect, getBridgeRecommendations);

// Weaviate management routes
router.get('/weaviate/status', protect, getWeaviateStatus);
router.post('/weaviate/init', protect, initializeWeaviate);
router.post('/weaviate/sync', protect, syncContextsToWeaviate);

// Update a context
router.put('/:id', protect, updateContext);

// Deactivate a context
router.put('/:id/deactivate', protect, deactivateContext);

// Delete a context (admin only)
router.delete('/:id', protect, deleteContext);

module.exports = router;