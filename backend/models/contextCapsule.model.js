const mongoose = require('mongoose');

const ContextCapsuleSchema = new mongoose.Schema({
  session_id: { type: String, index: true, unique: true },
  owner_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  capsule: {
    goals: { type: [String], default: [] },
    tone_prefs: { type: [String], default: [] },
    constraints: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    notes: { type: String, default: '' }
  },
  capsule_hash: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('ContextCapsule', ContextCapsuleSchema);

