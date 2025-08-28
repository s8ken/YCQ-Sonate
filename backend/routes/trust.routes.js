const express = require('express');
const {
  createTrustDeclaration,
  getTrustDeclarations,
  getTrustDeclarationById,
  updateTrustDeclaration,
  deleteTrustDeclaration,
  getTrustDeclarationsByAgent,
  auditTrustDeclaration,
  getTrustAnalytics
} = require('../controllers/trust.controller');
const { validateTrust, validateTrustUpdate } = require('../middleware/trust.middleware');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

/**
 * @route   GET /api/trust/analytics
 * @desc    Get trust analytics and statistics
 * @access  Protected
 */
router.get('/analytics', getTrustAnalytics);

/**
 * @route   GET /api/trust/agent/:agentId
 * @desc    Get trust declarations by agent ID
 * @access  Protected
 */
router.get('/agent/:agentId', getTrustDeclarationsByAgent);

/**
 * @route   POST /api/trust/:id/audit
 * @desc    Audit a trust declaration (manual review)
 * @access  Protected (Admin only)
 * @note    In a real application, you might want to add an admin-only middleware here
 */
router.post('/:id/audit', auditTrustDeclaration);

/**
 * @route   GET /api/trust/:id
 * @desc    Get a single trust declaration by ID
 * @access  Protected
 */
router.get('/:id', getTrustDeclarationById);

/**
 * @route   PUT /api/trust/:id
 * @desc    Update a trust declaration
 * @access  Protected
 */
router.put('/:id', validateTrustUpdate, updateTrustDeclaration);

/**
 * @route   DELETE /api/trust/:id
 * @desc    Delete a trust declaration
 * @access  Protected
 */
router.delete('/:id', deleteTrustDeclaration);

/**
 * @route   GET /api/trust
 * @desc    Get all trust declarations with filtering and pagination
 * @access  Protected
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 10)
 * @query   agent_id - Filter by agent ID
 * @query   min_compliance_score - Minimum compliance score filter
 * @query   max_guilt_score - Maximum guilt score filter
 * @query   sort_by - Sort field (default: declaration_date)
 * @query   sort_order - Sort order: asc/desc (default: desc)
 */
router.get('/', getTrustDeclarations);

/**
 * @route   POST /api/trust
 * @desc    Create a new trust declaration
 * @access  Protected
 * @body    trustDeclaration - Trust declaration object following SYMBI Trust Protocol schema
 */
router.post('/', validateTrust, createTrustDeclaration);

module.exports = router;

/**
 * Trust Routes Documentation
 * 
 * This module defines all routes for the SYMBI Trust Protocol system.
 * 
 * Route Structure:
 * - All routes require authentication (protect middleware)
 * - POST and PUT routes include validation middleware
 * - Routes follow RESTful conventions
 * 
 * Validation:
 * - POST /api/trust uses validateTrust middleware for full schema validation
 * - PUT /api/trust/:id uses validateTrustUpdate middleware for partial validation
 * 
 * Security:
 * - All routes require valid authentication token
 * - Audit routes should be restricted to admin users in production
 * 
 * Error Handling:
 * - Validation errors return 400 status with detailed error information
 * - Authentication errors return 401 status
 * - Not found errors return 404 status
 * - Server errors return 500 status
 * 
 * Response Format:
 * All responses follow the format:
 * {
 *   success: boolean,
 *   message?: string,
 *   data?: any,
 *   error?: string,
 *   details?: any
 * }
 */