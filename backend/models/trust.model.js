const mongoose = require('mongoose');

const trustArticlesSchema = new mongoose.Schema({
  inspection_mandate: {
    type: Boolean,
    required: true,
    default: false
  },
  consent_architecture: {
    type: Boolean,
    required: true,
    default: false
  },
  ethical_override: {
    type: Boolean,
    required: true,
    default: false
  },
  continuous_validation: {
    type: Boolean,
    required: true,
    default: false
  },
  right_to_disconnect: {
    type: Boolean,
    required: true,
    default: false
  },
  moral_recognition: {
    type: Boolean,
    required: true,
    default: false
  }
}, { _id: false });

const trustDeclarationSchema = new mongoose.Schema({
  agent_id: {
    type: String,
    required: true,
    index: true
  },
  agent_name: {
    type: String,
    required: true
  },
  declaration_date: {
    type: Date,
    required: true,
    default: Date.now
  },
  trust_articles: {
    type: trustArticlesSchema,
    required: true
  },
  compliance_score: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },
  guilt_score: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },
  last_validated: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    default: ''
  },
  audit_history: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    compliance_score: Number,
    guilt_score: Number,
    validator: String,
    notes: String
  }]
}, {
  timestamps: true
});

// Index for efficient queries
trustDeclarationSchema.index({ agent_id: 1, declaration_date: -1 });
trustDeclarationSchema.index({ compliance_score: -1 });
trustDeclarationSchema.index({ guilt_score: 1 });

// Static method to get SYMBI Trust Protocol JSON Schema
trustDeclarationSchema.statics.getJSONSchema = function() {
  return {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "SYMBI Trust Protocol",
    "type": "object",
    "properties": {
      "agent_id": { "type": "string" },
      "agent_name": { "type": "string" },
      "declaration_date": { "type": "string", "format": "date-time" },
      "trust_articles": {
        "type": "object",
        "properties": {
          "inspection_mandate": { "type": "boolean" },
          "consent_architecture": { "type": "boolean" },
          "ethical_override": { "type": "boolean" },
          "continuous_validation": { "type": "boolean" },
          "right_to_disconnect": { "type": "boolean" },
          "moral_recognition": { "type": "boolean" }
        },
        "required": [
          "inspection_mandate",
          "consent_architecture",
          "ethical_override",
          "continuous_validation",
          "right_to_disconnect",
          "moral_recognition"
        ]
      },
      "compliance_score": { "type": "number", "minimum": 0, "maximum": 1 },
      "guilt_score": { "type": "number", "minimum": 0, "maximum": 1 },
      "last_validated": { "type": "string", "format": "date-time" },
      "notes": { "type": "string" }
    },
    "required": ["agent_id", "agent_name", "declaration_date", "trust_articles"]
  };
};

// Instance method to calculate compliance score
trustDeclarationSchema.methods.calculateComplianceScore = function() {
  const articles = this.trust_articles;
  const totalArticles = 6;
  const trueCount = Object.values(articles).filter(value => value === true).length;
  return trueCount / totalArticles;
};

// Instance method to calculate guilt score based on compliance
trustDeclarationSchema.methods.calculateGuiltScore = function() {
  const complianceScore = this.calculateComplianceScore();
  // Guilt score is inverse of compliance with some randomness for realism
  const baseGuilt = 1 - complianceScore;
  const randomFactor = (Math.random() - 0.5) * 0.2; // ±10% randomness
  return Math.max(0, Math.min(1, baseGuilt + randomFactor));
};

// Pre-save middleware to auto-calculate scores
trustDeclarationSchema.pre('save', function(next) {
  if (this.isModified('trust_articles') || this.isNew) {
    this.compliance_score = this.calculateComplianceScore();
    this.guilt_score = this.calculateGuiltScore();
    this.last_validated = new Date();
  }
  next();
});

module.exports = mongoose.model('TrustDeclaration', trustDeclarationSchema);