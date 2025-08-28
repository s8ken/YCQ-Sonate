const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, 'Report category is required'],
    enum: ['daily', 'weekly', 'audit', 'alert'],
  },
  title: {
    type: String,
    required: [true, 'Report title is required'],
    trim: true,
  },
  content: {
    type: String,
    required: [true, 'Report content is required'],
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  stats: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map(),
  },
  createdBy: {
    type: String,
    enum: ['system', 'symbi', 'overseer'],
    default: 'symbi',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: null,
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
});

// Index for efficient querying by category and date
ReportSchema.index({ category: 1, createdAt: -1 });

// Virtual for report age
ReportSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Method to check if report is expired
ReportSchema.methods.isExpired = function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

// Static method to get latest report by category
ReportSchema.statics.getLatestByCategory = async function(category) {
  return this.findOne({ category }).sort({ createdAt: -1 }).exec();
};

// Static method to generate daily report
ReportSchema.statics.generateDailyReport = async function() {
  // This would be implemented with actual logic to generate reports
  // based on system activity, agent interactions, etc.
  const report = new this({
    category: 'daily',
    title: `Daily Status Report - ${new Date().toLocaleDateString()}`,
    content: 'Automatically generated daily status report.',
    stats: new Map([
      ['totalConversations', 0],
      ['totalAgents', 0],
      ['totalUsers', 0],
      ['activeUsers', 0]
    ]),
    createdBy: 'system',
  });
  
  return report.save();
};

module.exports = mongoose.model('Report', ReportSchema);