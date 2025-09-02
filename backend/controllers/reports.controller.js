const asyncHandler = require('express-async-handler');
const Report = require('../models/report.model');

// @desc    Get all reports with pagination and filtering
// @route   GET /api/reports
// @access  Private
const getAllReports = asyncHandler(async (req, res) => {
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
});

// @desc    Get a specific report by ID
// @route   GET /api/reports/:id
// @access  Private
const getReportById = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  
  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }
  
  res.json(report);
});

// @desc    Create a new report
// @route   POST /api/reports
// @access  Private (admin/system)
const createReport = asyncHandler(async (req, res) => {
  const { category, title, content, metadata, stats, createdBy } = req.body;
  
  const report = new Report({
    category,
    title,
    content,
    metadata: metadata || {},
    stats: stats ? new Map(Object.entries(stats)) : new Map(),
    createdBy: createdBy || 'system',
  });
  
  const createdReport = await report.save();
  res.status(201).json(createdReport);
});

// @desc    Update a report
// @route   PUT /api/reports/:id
// @access  Private (admin/system)
const updateReport = asyncHandler(async (req, res) => {
  const { category, title, content, metadata, stats, isArchived } = req.body;
  
  const report = await Report.findById(req.params.id);
  
  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }
  
  if (category) report.category = category;
  if (title) report.title = title;
  if (content) report.content = content;
  if (metadata) report.metadata = metadata;
  if (stats) report.stats = new Map(Object.entries(stats));
  if (isArchived !== undefined) report.isArchived = isArchived;
  
  const updatedReport = await report.save();
  res.json(updatedReport);
});

// @desc    Delete a report
// @route   DELETE /api/reports/:id
// @access  Private (admin)
const deleteReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  
  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }
  
  await report.remove();
  res.json({ message: 'Report deleted' });
});

// @desc    Generate a daily report
// @route   POST /api/reports/generate/daily
// @access  Private (system/admin)
const generateDailyReport = asyncHandler(async (req, res) => {
  const report = await Report.generateDailyReport();
  res.status(201).json(report);
});

module.exports = {
  getAllReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
  generateDailyReport,
};