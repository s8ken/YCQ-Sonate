const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['user', 'ai', 'system', 'ci-system'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  encryptedContent: {
    type: String,
    default: null,
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  ciModel: {
    type: String,
    enum: ['none', 'symbi-core', 'overseer'],
    default: 'none',
  },
  trustScore: {
    type: Number,
    min: 0,
    max: 5,
    default: 5,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ConversationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Conversation title is required'],
    trim: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  messages: [MessageSchema],
  agents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
  }],
  isArchived: {
    type: Boolean,
    default: false,
  },
  contextTags: [{
    type: String,
    trim: true,
  }],
  ciEnabled: {
    type: Boolean,
    default: false,
  },
  ethicalScore: {
    type: Number,
    min: 0,
    max: 5,
    default: 5,
  },
  lastActivity: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Update lastActivity timestamp when new messages are added
ConversationSchema.pre('save', function(next) {
  if (this.isModified('messages')) {
    this.lastActivity = Date.now();
  }
  next();
});

// Create a text index for search functionality
ConversationSchema.index({ title: 'text', 'messages.content': 'text', 'contextTags': 'text' });
ConversationSchema.index({ ciEnabled: 1 });
ConversationSchema.index({ ethicalScore: 1 });

// Method to export conversation to IPFS (placeholder)
ConversationSchema.methods.exportToIPFS = async function() {
  // This would be implemented with actual IPFS integration
  return {
    success: true,
    hash: `ipfs-${this._id}-${Date.now()}`,
    timestamp: new Date()
  };
};

// Method to calculate ethical score based on message content
ConversationSchema.methods.calculateEthicalScore = async function() {
  // This would be implemented with actual ethical analysis logic
  // For now, we'll use a simple placeholder implementation
  const messageCount = this.messages.length;
  const trustScoreSum = this.messages.reduce((sum, msg) => sum + (msg.trustScore || 5), 0);
  
  this.ethicalScore = Math.min(5, Math.max(0, trustScoreSum / (messageCount || 1)));
  return this.save();
};

module.exports = mongoose.model('Conversation', ConversationSchema);
