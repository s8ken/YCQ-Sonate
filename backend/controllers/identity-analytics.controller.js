const asyncHandler = require("express-async-handler")
const IdentityAnalyticsService = require("../services/identity-analytics.service")

/**
 * @desc    Get identity verification analytics
 * @route   GET /api/analytics/identity
 * @access  Protected (Admin)
 */
const getIdentityAnalytics = asyncHandler(async (req, res) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      verificationMethod: req.query.verificationMethod,
    }

    const analytics = await IdentityAnalyticsService.getIdentityVerificationAnalytics(filters)

    res.json({
      success: true,
      data: analytics,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to get identity analytics",
      message: error.message,
   \
