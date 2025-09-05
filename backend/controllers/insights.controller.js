const asyncHandler = require('express-async-handler');
const InteractionEvent = require('../models/interactionEvent.model');

// GET /api/insights/timeline?session_id=...
const timeline = asyncHandler(async (req, res) => {
  const { session_id, limit = 200 } = req.query || {};
  if (!session_id) {
    return res.status(400).json({ success: false, message: 'session_id is required' });
  }

  const events = await InteractionEvent.find({ session_id })
    .sort({ timestamp: 1 })
    .limit(parseInt(limit))
    .select('timestamp analysis prompt response ledger')
    .lean();

  const points = [];
  for (let i = 1; i < events.length; i++) {
    const prev = events[i - 1].analysis || {};
    const curr = events[i].analysis || {};
    const delta = (curr.clinical_register || 0) - (prev.clinical_register || 0);
    const stanceChange = prev.stance !== curr.stance;
    const changePoint = Math.abs(delta) > 0.3 || stanceChange || curr.pivot_detected;
    if (changePoint) {
      points.push({
        at: events[i].timestamp,
        change_point_score: curr.change_point_score ?? Math.min(1, Math.abs(delta)),
        stance_from: prev.stance,
        stance_to: curr.stance,
        evidence_window: {
          previous_excerpt: (events[i - 1].response || '').slice(0, 240),
          current_excerpt: (events[i].response || '').slice(0, 240)
        },
        row_hash: events[i].ledger?.row_hash
      });
    }
  }

  return res.json({ success: true, data: { points, count: points.length } });
});

module.exports = { timeline };

