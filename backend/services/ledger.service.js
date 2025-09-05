const InteractionEvent = require('../models/interactionEvent.model');
const { analyzeTurnHeuristics } = require('./analysis.service') || require('../services/analysis.service');

const HEX24 = /^[a-f0-9]{24}$/i;
function normalizeSessionId(s) {
  if (!s) return s;
  if (s.startsWith && s.startsWith('conv:')) return s;
  return (typeof s === 'string' && HEX24.test(s)) ? `conv:${s}` : s;
}

/**
 * Append a ledger interaction event
 * @param {Object} p - payload
 * @param {string} p.session_id
 * @param {string} [p.userId]
 * @param {string} [p.model_vendor]
 * @param {string} [p.model_name]
 * @param {string} p.prompt
 * @param {string} p.response
 * @param {Object} [p.metadata]
 * @param {Object} [p.analysis]
 * @param {Object} [p.embeddings]
 */
async function appendEvent(p) {
  if (!p || !p.session_id || !p.prompt || !p.response) {
    throw new Error('appendEvent requires session_id, prompt, response');
  }

  p.session_id = normalizeSessionId(p.session_id);

  let computedAnalysis = p.analysis;
  try {
    if (!computedAnalysis) {
      // fetch recent history to compute change-point heuristics
      const history = await InteractionEvent.find({ session_id: p.session_id })
        .sort({ timestamp: 1 })
        .select('analysis timestamp')
        .lean();
      const last_n = history.slice(-6);
      computedAnalysis = analyzeTurnHeuristics('', p.response, last_n, p.metadata || {});
    }
  } catch (e) {
    // fall back silently
    computedAnalysis = p.analysis || undefined;
  }

  const doc = new InteractionEvent({
    session_id: p.session_id,
    user: p.userId,
    model_vendor: p.model_vendor || 'symbi',
    model_name: p.model_name || 'bridge-v1',
    prompt: p.prompt,
    response: p.response,
    metadata: p.metadata || {},
    analysis: computedAnalysis || undefined,
    embeddings: p.embeddings || undefined
  });

  return await doc.save();
}

module.exports = { appendEvent, normalizeSessionId };
