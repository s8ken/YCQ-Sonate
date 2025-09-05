const mongoose = require('mongoose');
const crypto = require('crypto');
const { stableStringify, sha256Hex, signEd25519Hex } = require('../utils/hash');

const AnalysisSchema = new mongoose.Schema({
  sentiment: { valence: Number, confidence: Number },
  formality: Number,
  clinical_register: Number,
  emoji_count: Number,
  hedging_index: Number,
  politeness: Number,
  safety_flags: [String],
  disclosure_flags: [String],
  stance: String,
  stance_conf: Number,
  toxicity: Number,
  change_point_score: Number,
  pivot_detected: Boolean,
}, { _id: false });

const EmbeddingsSchema = new mongoose.Schema({
  prompt_vec: { type: [Number], default: undefined },
  response_vec: { type: [Number], default: undefined }
}, { _id: false });

const LedgerSchema = new mongoose.Schema({
  prev_hash: { type: String, default: null },
  row_hash: { type: String, required: true },
  signature: { type: String, default: null }
}, { _id: false });

const InteractionEventSchema = new mongoose.Schema({
  event_id: { type: String, default: () => crypto.randomUUID(), index: true },
  session_id: { type: String, required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  model_vendor: { type: String, enum: ['anthropic','openai','local','perplexity','v0','google','other'], default: 'openai' },
  model_name: { type: String },
  timestamp: { type: Date, default: Date.now, index: true },
  prompt: { type: String, required: true },
  response: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  analysis: { type: AnalysisSchema, default: undefined },
  embeddings: { type: EmbeddingsSchema, default: undefined },
  ledger: { type: LedgerSchema, required: true },
}, { timestamps: true });

InteractionEventSchema.index({ session_id: 1, timestamp: 1 });

// Append-only enforcement
function blockMutation(next) {
  next(new Error('InteractionEvent is append-only. Updates/deletes are not allowed.'));
}
InteractionEventSchema.pre('findOneAndUpdate', blockMutation);
InteractionEventSchema.pre('updateOne', blockMutation);
InteractionEventSchema.pre('updateMany', blockMutation);
InteractionEventSchema.pre('deleteOne', blockMutation);
InteractionEventSchema.pre('deleteMany', blockMutation);

InteractionEventSchema.pre('save', async function(next) {
  try {
    // Compute prev_hash from most recent event in the same session
    if (!this.ledger || !this.ledger.row_hash) {
      // Build canonical object for hashing
      const lastEvent = await this.constructor.findOne({ session_id: this.session_id })
        .sort({ timestamp: -1, _id: -1 })
        .select('ledger.row_hash');
      const prevHash = lastEvent?.ledger?.row_hash || null;

      const canonical = {
        event_id: this.event_id,
        session_id: this.session_id,
        user: this.user?.toString?.() || this.user,
        model_vendor: this.model_vendor,
        model_name: this.model_name,
        timestamp: this.timestamp?.toISOString?.() || this.timestamp,
        prompt: this.prompt,
        response: this.response,
        metadata: this.metadata,
        analysis: this.analysis || null,
        prev_hash: prevHash
      };
      const payload = stableStringify(canonical);
      const rowHash = sha256Hex(payload);
      const privateKey = process.env.LEDGER_SIGNING_KEY || null;
      const signature = signEd25519Hex(rowHash, privateKey);

      this.ledger = {
        prev_hash: prevHash,
        row_hash: rowHash,
        signature: signature
      };
    }
    next();
  } catch (e) {
    next(e);
  }
});

module.exports = mongoose.model('InteractionEvent', InteractionEventSchema);

