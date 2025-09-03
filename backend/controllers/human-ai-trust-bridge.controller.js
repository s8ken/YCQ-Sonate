const asyncHandler = require("express-async-handler")
const HumanAITrustBridge = require("../services/human-ai-trust-bridge.service")

/**
 * @desc    Establish mutual trust between human and AI agent
 * @route   POST /api/trust-bridge/establish
 * @access  Protected
 */
const establishMutualTrust = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id
    const { agentId, options } = req.body

    if (!agentId) {
      return res.status(400).json({
        success: false,
        error: "Agent ID is required",
      })
    }

    const result = await HumanAITrustBridge.establishMutualTrust(userId, agentId, options)

    if (result.success) {
      res.status(201).json({
        success: true,
        message: result.message,
        data: result.trustBridge,
      })
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        details: {
          scores: result.scores,
          validations: result.validations,
        },
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to establish mutual trust",
      message: error.message,
    })
  }
})

/**
 * @desc    Get trust bridge between human and AI agent
 * @route   GET /api/trust-bridge/:agentId
 * @access  Protected
 */
const getTrustBridge = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id
    const { agentId } = req.params

    const trustBridge = HumanAITrustBridge.getTrustBridge(userId, agentId)

    if (!trustBridge) {
      return res.status(404).json({
        success: false,
        error: "Trust bridge not found",
      })
    }

    res.json({
      success: true,
      data: trustBridge,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to get trust bridge",
      message: error.message,
    })
  }
})

/**
 * @desc    Get all trust bridges for user
 * @route   GET /api/trust-bridge
 * @access  Protected
 */
const getUserTrustBridges = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id

    const trustBridges = HumanAITrustBridge.getUserTrustBridges(userId)

    res.json({
      success: true,
      data: trustBridges,
      count: trustBridges.length,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to get trust bridges",
      message: error.message,
    })
  }
})

/**
 * @desc    Update trust bridge with interaction
 * @route   PUT /api/trust-bridge/:bridgeId/interaction
 * @access  Protected
 */
const updateTrustBridge = asyncHandler(async (req, res) => {
  try {
    const { bridgeId } = req.params
    const interaction = req.body

    const updatedBridge = await HumanAITrustBridge.updateTrustBridge(bridgeId, interaction)

    res.json({
      success: true,
      message: "Trust bridge updated successfully",
      data: updatedBridge,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to update trust bridge",
      message: error.message,
    })
  }
})

/**
 * @desc    Revoke trust bridge
 * @route   DELETE /api/trust-bridge/:bridgeId
 * @access  Protected
 */
const revokeTrustBridge = asyncHandler(async (req, res) => {
  try {
    const { bridgeId } = req.params
    const { reason } = req.body

    const success = await HumanAITrustBridge.revokeTrustBridge(bridgeId, reason || "User requested revocation")

    if (success) {
      res.json({
        success: true,
        message: "Trust bridge revoked successfully",
      })
    } else {
      res.status(404).json({
        success: false,
        error: "Trust bridge not found",
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to revoke trust bridge",
      message: error.message,
    })
  }
})

module.exports = {
  establishMutualTrust,
  getTrustBridge,
  getUserTrustBridges,
  updateTrustBridge,
  revokeTrustBridge,
}
