const mongoose = require('mongoose');
const weaviateService = require('../services/weaviate.service');

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
  },
  // Weaviate integration fields
  weaviateId: {
    type: String,
    index: true,
    sparse: true
  },
  vectorized: {
    type: Boolean,
    default: false
  },
  lastVectorUpdate: {
    type: Date,
    default: null
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

// Method to sync with Weaviate
ContextSchema.methods.syncToWeaviate = async function() {
  try {
    if (!weaviateService.isConnected) {
      console.warn('Weaviate service not connected, skipping sync');
      return;
    }

    if (this.weaviateId) {
      // Update existing vector
      await weaviateService.updateContext(this.weaviateId, {
        data: this.data,
        trustScore: this.trustScore,
        isActive: this.isActive
      });
    } else {
      // Create new vector
      const result = await weaviateService.storeContext(this.toObject());
      this.weaviateId = result.weaviateId;
      this.vectorized = true;
      this.lastVectorUpdate = new Date();
      await this.save();
    }
  } catch (error) {
    console.error('Failed to sync context to Weaviate:', error.message);
  }
};

// Method to remove from Weaviate
ContextSchema.methods.removeFromWeaviate = async function() {
  try {
    if (this.weaviateId && weaviateService.isConnected) {
      await weaviateService.deleteContext(this.weaviateId);
    }
  } catch (error) {
    console.error('Failed to remove context from Weaviate:', error.message);
  }
};

// Static method to perform semantic search
ContextSchema.statics.semanticSearch = async function(query, options = {}) {
  try {
    if (!weaviateService.isConnected) {
      console.warn('Weaviate service not connected, falling back to MongoDB search');
      return this.find({
        $or: [
          { tag: { $regex: query, $options: 'i' } },
          { 'data': { $regex: query, $options: 'i' } }
        ],
        isActive: true
      }).limit(options.limit || 10).exec();
    }

    const weaviateResults = await weaviateService.searchContexts(query, options);
    
    // Fetch full MongoDB documents for the results
    const mongoIds = weaviateResults
      .map(result => result.mongoId)
      .filter(id => id);
    
    if (mongoIds.length === 0) {
      return [];
    }

    const contexts = await this.find({
      _id: { $in: mongoIds }
    }).exec();

    // Maintain order from Weaviate results
    const orderedContexts = weaviateResults.map(wResult => 
      contexts.find(ctx => ctx._id.toString() === wResult.mongoId)
    ).filter(ctx => ctx);

    return orderedContexts;
  } catch (error) {
    console.error('Semantic search failed:', error.message);
    throw error;
  }
};

// Static method to get bridge recommendations
ContextSchema.statics.getBridgeRecommendations = async function(sourceTag, limit = 5) {
  try {
    if (!weaviateService.isConnected) {
      console.warn('Weaviate service not connected, using basic recommendations');
      return this.find({
        tag: { $ne: sourceTag },
        isActive: true
      }).limit(limit).exec();
    }

    const recommendations = await weaviateService.getBridgeRecommendations(sourceTag, limit);
    
    const mongoIds = recommendations
      .map(rec => rec.mongoId)
      .filter(id => id);
    
    if (mongoIds.length === 0) {
      return [];
    }

    const contexts = await this.find({
      _id: { $in: mongoIds }
    }).exec();

    return contexts;
  } catch (error) {
    console.error('Failed to get bridge recommendations:', error.message);
    throw error;
  }
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
  
  const savedContext = await bridgeContext.save();
  
  // Sync to Weaviate after saving
  await savedContext.syncToWeaviate();
  
  return savedContext;
};

// Post-save middleware to sync with Weaviate
ContextSchema.post('save', async function(doc) {
  // Only sync if the document is new or data has changed
  if (this.isNew || this.isModified('data') || this.isModified('trustScore') || this.isModified('isActive')) {
    await doc.syncToWeaviate();
  }
});

// Pre-remove middleware to clean up Weaviate
ContextSchema.pre('remove', async function() {
  await this.removeFromWeaviate();
});

// Pre-deleteOne middleware to clean up Weaviate
ContextSchema.pre('deleteOne', { document: true, query: false }, async function() {
  await this.removeFromWeaviate();
});

module.exports = mongoose.model('Context', ContextSchema);