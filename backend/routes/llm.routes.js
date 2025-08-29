const express = require('express');
const router = express.Router();
const { getProviders, getModels, generateResponse, streamResponse, performCodeReview } = require('../controllers/llm.controller');
const { protect } = require('../middleware/auth.middleware');

// LLM provider and model routes
router.get('/providers', protect, getProviders);
router.get('/models/:provider', protect, getModels);

// LLM interaction routes
router.post('/generate', protect, generateResponse);
router.post('/stream', protect, streamResponse);
router.post('/code-review', protect, performCodeReview);

module.exports = router;
