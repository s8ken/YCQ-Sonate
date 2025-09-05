const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getAllReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
  generateDailyReport,
} = require('../controllers/reports.controller');

// Get all reports with pagination and filtering
router.get('/', protect, getAllReports);

// Get a specific report by ID
router.get('/:id', protect, getReportById);

// Create a new report (admin/system only)
router.post('/', protect, createReport);

// Update a report (admin/system only)
router.put('/:id', protect, updateReport);

// Delete a report (admin only)
router.delete('/:id', protect, deleteReport);

// Generate a daily report (system/admin only)
router.post('/generate/daily', protect, generateDailyReport);

module.exports = router;