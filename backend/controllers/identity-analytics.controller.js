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
    })
  }
})

/**
 * @desc    Get trust bridge analytics
 * @route   GET /api/analytics/trust-bridge
 * @access  Protected (Admin)
 */
const getTrustBridgeAnalytics = asyncHandler(async (req, res) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      trustLevel: req.query.trustLevel,
    }

    const analytics = await IdentityAnalyticsService.getTrustBridgeAnalytics(filters)

    res.json({
      success: true,
      data: analytics,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to get trust bridge analytics",
      message: error.message,
    })
  }
})

/**
 * @desc    Get system health metrics
 * @route   GET /api/analytics/system-health
 * @access  Protected (Admin)
 */
const getSystemHealth = asyncHandler(async (req, res) => {
  try {
    const health = await IdentityAnalyticsService.getSystemHealth()

    res.json({
      success: true,
      data: health,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to get system health",
      message: error.message,
    })
  }
})

/**
 * @desc    Get verification trends
 * @route   GET /api/analytics/verification-trends
 * @access  Protected (Admin)
 */
const getVerificationTrends = asyncHandler(async (req, res) => {
  try {
    const period = req.query.period || "30d"
    const trends = await IdentityAnalyticsService.getVerificationTrends(period)

    res.json({
      success: true,
      data: trends,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to get verification trends",
      message: error.message,
    })
  }
})

module.exports = {
  getIdentityAnalytics,
  getTrustBridgeAnalytics,
  getSystemHealth,
  getVerificationTrends,
}
