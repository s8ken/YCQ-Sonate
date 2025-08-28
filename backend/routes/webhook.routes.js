const express = require('express');
const router = express.Router();
const skyIntegrationService = require('../services/skyIntegration.service');
const asyncHandler = require('express-async-handler');

// @desc    Handle webhook from Sky project
// @route   POST /api/webhooks/sky/:agentId
// @access  Public (but should be secured with webhook signatures in production)
const handleSkyWebhook = asyncHandler(async (req, res) => {
  const { agentId } = req.params;
  const payload = req.body;

  // Validate payload
  if (!payload || !payload.type) {
    return res.status(400).json({
      success: false,
      message: 'Invalid webhook payload - type is required'
    });
  }

  // Process the webhook
  const result = await skyIntegrationService.processWebhook(payload, agentId);

  if (result.success) {
    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
      data: result.data,
      timestamp: result.timestamp
    });
  } else {
    res.status(400).json({
      success: false,
      message: result.message,
      error: result.error,
      timestamp: result.timestamp
    });
  }
});

// @desc    Test webhook endpoint
// @route   POST /api/webhooks/test
// @access  Public
const testWebhook = asyncHandler(async (req, res) => {
  const payload = req.body;
  
  res.status(200).json({
    success: true,
    message: 'Webhook test successful',
    received: payload,
    timestamp: new Date().toISOString()
  });
});

// @desc    Get webhook status
// @route   GET /api/webhooks/status
// @access  Public
const getWebhookStatus = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Webhook service is running',
    timestamp: new Date().toISOString(),
    endpoints: {
      sky_webhook: '/api/webhooks/sky/:agentId',
      test_webhook: '/api/webhooks/test',
      status: '/api/webhooks/status'
    }
  });
});

// Webhook routes
router.post('/sky/:agentId', handleSkyWebhook);
router.post('/test', testWebhook);
router.get('/status', getWebhookStatus);

module.exports = router;