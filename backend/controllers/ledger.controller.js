const asyncHandler = require('express-async-handler');
const InteractionEvent = require('../models/interactionEvent.model');
const { analyzeTurnHeuristics } = require('../services/analysis.service');
const { stableStringify, sha256Hex } = require('../utils/hash');

// POST /api/events
const ingestEvent = asyncHandler(async (req, res) => {
  const { session_id, model_vendor, model_name, prompt, response, metadata, analysis, embeddings } = req.body || {};
  if (!session_id || !prompt || !response) {
    return res.status(400).json({ success: false, message: 'session_id, prompt, and response are required' });
  }

  // Auto-analyze if not provided
  let computedAnalysis = analysis;
  if (!computedAnalysis) {
    const history = await InteractionEvent.find({ session_id }).sort({ timestamp: 1 }).select('analysis timestamp').lean();
    const last_n = history.slice(-6);
    computedAnalysis = analyzeTurnHeuristics(prompt, response, last_n, metadata);
  }

  const doc = new InteractionEvent({
    session_id,
    user: req.user.id,
    model_vendor: model_vendor || 'openai',
    model_name: model_name || null,
    prompt,
    response,
    metadata: metadata || {},
    analysis: computedAnalysis || undefined,
    embeddings: embeddings || undefined
  });
  const saved = await doc.save();

  return res.status(201).json({
    success: true,
    data: {
      event_id: saved.event_id,
      session_id: saved.session_id,
      timestamp: saved.timestamp,
      ledger: saved.ledger
    }
  });
});

// GET /api/ledger
const getLedger = asyncHandler(async (req, res) => {
  const { session_id, page = 1, limit = 20, since_row_hash } = req.query;
  if (!session_id) {
    return res.status(400).json({ success: false, message: 'session_id is required' });
  }

  const q = { session_id };
  if (since_row_hash) {
    const anchor = await InteractionEvent.findOne({ 'ledger.row_hash': since_row_hash });
    if (anchor) q.timestamp = { $gt: anchor.timestamp };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [items, total] = await Promise.all([
    InteractionEvent.find(q).sort({ timestamp: 1 }).skip(skip).limit(parseInt(limit)).lean(),
    InteractionEvent.countDocuments(q)
  ]);

  return res.json({
    success: true,
    data: items,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      total_pages: Math.ceil(total / parseInt(limit))
    }
  });
});

module.exports = {
  ingestEvent,
  getLedger,
  // Verify hash-chain integrity for a session
  verify: asyncHandler(async (req, res) => {
    const { session_id } = req.query || {};
    if (!session_id) return res.status(400).json({ success: false, message: 'session_id is required' });
    const items = await InteractionEvent.find({ session_id }).sort({ timestamp: 1 }).lean();
    let prev = null;
    for (let i = 0; i < items.length; i++) {
      const ev = items[i];
      // reconstruct canonical payload used in pre-save
      const canonical = {
        event_id: ev.event_id,
        session_id: ev.session_id,
        user: ev.user?.toString?.() || ev.user,
        model_vendor: ev.model_vendor,
        model_name: ev.model_name,
        timestamp: (ev.timestamp instanceof Date ? ev.timestamp.toISOString() : ev.timestamp),
        prompt: ev.prompt,
        response: ev.response,
        metadata: ev.metadata,
        analysis: ev.analysis || null,
        prev_hash: prev
      };
      const expect = sha256Hex(stableStringify(canonical));
      const goodPrev = (ev.ledger?.prev_hash || null) === prev;
      const goodRow = (ev.ledger?.row_hash || '') === expect;
      if (!goodPrev || !goodRow) {
        return res.json({ success: false, ok: false, break_at: i, event_id: ev.event_id, expected_prev: prev, actual_prev: ev.ledger?.prev_hash, expected_row: expect, actual_row: ev.ledger?.row_hash });
      }
      prev = ev.ledger?.row_hash || null;
    }
    return res.json({ success: true, ok: true, count: items.length });
  })
};
