const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Report = require('../models/report.model');

// Get all reports with pagination and filtering
router.get('/', protect, async (req, res) => {
  try {
    const { category, page = 1, limit = 10, archived } = req.query;
    const query = {};
    
    if (category) query.category = category;
    if (archived !== undefined) query.isArchived = archived === 'true';
    
    const options = {
      sort: { createdAt: -1 },
      skip: (page - 1) * limit,
      limit: parseInt(limit),
    };
    
    const reports = await Report.find(query, null, options);
    const total = await Report.countDocuments(query);
    
    res.json({
      reports,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific report by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    res.json(report);
  } catch (err) {
    console.error('Error fetching report:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new report (admin/system only)
router.post('/', protect, async (req, res) => {
  try {
    // Check if user has admin role (would be implemented with proper role checking)
    // For now, we'll allow any authenticated user to create reports
    
    const { category, title, content, metadata, stats, createdBy } = req.body;
    
    const report = new Report({
      category,
      title,
      content,
      metadata: metadata || {},
      stats: stats ? new Map(Object.entries(stats)) : new Map(),
      createdBy: createdBy || 'system',
    });
    
    await report.save();
    res.status(201).json(report);
  } catch (err) {
    console.error('Error creating report:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a report (admin/system only)
router.put('/:id', protect, async (req, res) => {
  try {
    // Check if user has admin role (would be implemented with proper role checking)
    // For now, we'll allow any authenticated user to update reports
    
    const { category, title, content, metadata, stats, isArchived } = req.body;
    
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    if (category) report.category = category;
    if (title) report.title = title;
    if (content) report.content = content;
    if (metadata) report.metadata = metadata;
    if (stats) report.stats = new Map(Object.entries(stats));
    if (isArchived !== undefined) report.isArchived = isArchived;
    
    await report.save();
    res.json(report);
  } catch (err) {
    console.error('Error updating report:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a report (admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    // Check if user has admin role (would be implemented with proper role checking)
    // For now, we'll allow any authenticated user to delete reports
    
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    await report.remove();
    res.json({ message: 'Report deleted' });
  } catch (err) {
    console.error('Error deleting report:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate a daily report (system/admin only)
router.post('/generate/daily', protect, async (req, res) => {
  try {
    // Check if user has admin role (would be implemented with proper role checking)
    // For now, we'll allow any authenticated user to generate reports
    
    const report = await Report.generateDailyReport();
    res.status(201).json(report);
  } catch (err) {
    console.error('Error generating daily report:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;