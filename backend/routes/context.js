const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Context = require('../models/context.model');

// Get all contexts with pagination and filtering
router.get('/', protect, async (req, res) => {
  try {
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
  } catch (err) {
    console.error('Error fetching contexts:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get active contexts by tag
router.get('/tag/:tag', protect, async (req, res) => {
  try {
    const contexts = await Context.getActiveByTag(req.params.tag);
    res.json(contexts);
  } catch (err) {
    console.error('Error fetching contexts by tag:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific context by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const context = await Context.findById(req.params.id);
    
    if (!context) {
      return res.status(404).json({ message: 'Context not found' });
    }
    
    res.json(context);
  } catch (err) {
    console.error('Error fetching context:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new context
router.post('/', protect, async (req, res) => {
  try {
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
    
    await context.save();
    res.status(201).json(context);
  } catch (err) {
    console.error('Error creating context:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a context bridge
router.post('/bridge', protect, async (req, res) => {
  try {
    const { fromTag, toTag, data } = req.body;
    
    if (!fromTag || !toTag || !data) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const bridgeContext = await Context.createBridge(fromTag, toTag, data);
    res.status(201).json(bridgeContext);
  } catch (err) {
    console.error('Error creating context bridge:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// Update a context
router.put('/:id', protect, async (req, res) => {
  try {
    const { data, metadata, trustScore, isActive } = req.body;
    
    const context = await Context.findById(req.params.id);
    
    if (!context) {
      return res.status(404).json({ message: 'Context not found' });
    }
    
    if (data) context.data = data;
    if (metadata) context.metadata = metadata;
    if (trustScore !== undefined) context.trustScore = trustScore;
    if (isActive !== undefined) context.isActive = isActive;
    
    await context.save();
    res.json(context);
  } catch (err) {
    console.error('Error updating context:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Deactivate a context
router.put('/:id/deactivate', protect, async (req, res) => {
  try {
    const context = await Context.findById(req.params.id);
    
    if (!context) {
      return res.status(404).json({ message: 'Context not found' });
    }
    
    await context.deactivate();
    res.json(context);
  } catch (err) {
    console.error('Error deactivating context:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a context (admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    // Check if user has admin role (would be implemented with proper role checking)
    // For now, we'll allow any authenticated user to delete contexts
    
    const context = await Context.findById(req.params.id);
    
    if (!context) {
      return res.status(404).json({ message: 'Context not found' });
    }
    
    await context.remove();
    res.json({ message: 'Context deleted' });
  } catch (err) {
    console.error('Error deleting context:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;