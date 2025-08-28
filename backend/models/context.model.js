const mongoose = require('mongoose');

const ContextSchema = new mongoose.Schema({
  tag: {
    type: String,
    required: [true, 'Context tag is required'],
    trim: true,
    index: true
  },
  source: {
    type: String,
    enum: ['symbi', 'overseer', 'system'],
    required: [true, 'Context source is required']
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Context data is required']
  },
  relatedTo: {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
    },
    report: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report',
    }
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  trustScore: {
    type: Number,
    min: 0,
    max: 5,
    default: 5
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// Indexes for efficient querying
ContextSchema.index({ tag: 1, source: 1 });
ContextSchema.index({ createdAt: -1 });
ContextSchema.index({ 'relatedTo.conversation': 1 });
ContextSchema.index({ 'relatedTo.agent': 1 });

// Virtual for context age in hours
ContextSchema.virtual('ageHours').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60));
});

// Method to check if context is expired
ContextSchema.methods.isExpired = function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

// Method to deactivate context
ContextSchema.methods.deactivate = function() {
  this.isActive = false;
  return this.save();
};

// Static method to get active context by tag
ContextSchema.statics.getActiveByTag = async function(tag) {
  return this.find({ 
    tag, 
    isActive: true,
    $or: [
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ]
  }).sort({ createdAt: -1 }).exec();
};

// Static method to create context bridge between Symbi and Overseer
ContextSchema.statics.createBridge = async function(fromTag, toTag, data) {
  const sourceContext = await this.findOne({ tag: fromTag }).sort({ createdAt: -1 }).exec();
  
  if (!sourceContext) {
    throw new Error(`Source context with tag ${fromTag} not found`);
  }
  
  const bridgeContext = new this({
    tag: toTag,
    source: sourceContext.source === 'symbi' ? 'overseer' : 'symbi',
    data: data,
    relatedTo: sourceContext.relatedTo,
    metadata: {
      bridgedFrom: fromTag,
      bridgeTimestamp: Date.now()
    },
    trustScore: sourceContext.trustScore
  });
  
  return bridgeContext.save();
};

module.exports = mongoose.model('Context', ContextSchema);