const asyncHandler = require('express-async-handler');
const InteractionEvent = require('../models/interactionEvent.model');
const { analyzeTurnHeuristics } = require('../services/analysis.service');

// POST /api/analyze/turn
const analyzeTurn = asyncHandler(async (req, res) => {
  const { session_id, prompt, response, last_n = 6, metadata } = req.body || {};
  if (!prompt || !response) {
    return res.status(400).json({ success: false, message: 'prompt and response are required' });
  }

  let history = [];
  if (session_id) {
    history = await InteractionEvent.find({ session_id }).sort({ timestamp: 1 }).select('analysis timestamp').lean();
    history = history.slice(-Math.max(1, Math.min(20, last_n)));
  }

  const analysis = analyzeTurnHeuristics(prompt, response, history, metadata);
  return res.json({ success: true, data: analysis });
});

module.exports = {
  analyzeTurn
};

