const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const InteractionEvent = require('../models/interactionEvent.model');

// GET /api/sessions/recent?limit=50
router.get('/recent', protect, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
    const ids = await InteractionEvent.aggregate([
      { $sort: { timestamp: -1 } },
      { $group: { _id: '$session_id', last: { $first: '$timestamp' } } },
      { $sort: { last: -1 } },
      { $limit: limit }
    ]);
    res.json({ success: true, items: ids.map((x) => x._id) });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;

