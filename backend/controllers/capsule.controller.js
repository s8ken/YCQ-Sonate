const crypto = require('crypto');
const ContextCapsule = require('../models/contextCapsule.model');

const HEX24 = /^[a-f0-9]{24}$/i;
function normalizeSessionId(s) {
  if (!s) return s;
  if (s.startsWith && s.startsWith('conv:')) return s;
  return (typeof s === 'string' && HEX24.test(s)) ? `conv:${s}` : s;
}

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

module.exports = {
  get: async (req, res) => {
    try {
      const sid = normalizeSessionId(String(req.params.sessionId || ''));
      const doc = await ContextCapsule.findOne({ session_id: sid }).lean();
      return res.json(doc || { session_id: sid, capsule: {} });
    } catch (e) {
      return res.status(500).json({ success: false, message: e.message });
    }
  },
  put: async (req, res) => {
    try {
      const sid = normalizeSessionId(String(req.params.sessionId || ''));
      const body = req.body?.capsule || {};
      const hash = sha256(JSON.stringify(body));
      const updated = await ContextCapsule.findOneAndUpdate(
        { session_id: sid },
        { $set: { capsule: body, capsule_hash: hash, owner_user: req.user?._id } },
        { upsert: true, new: true }
      ).lean();
      return res.json(updated);
    } catch (e) {
      return res.status(500).json({ success: false, message: e.message });
    }
  }
};

