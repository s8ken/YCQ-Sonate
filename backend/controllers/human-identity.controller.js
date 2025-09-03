const asyncHandler = require("express-async-handler")
const HumanIdentityService = require("../services/human-identity.service")
const { ConsentEnvelope, HumanIdentityDeclaration } = require("../models/human-identity.model")

/**
 * @desc    Create consent envelope
 * @route   POST /api/human-identity/consent
 * @access  Protected
 */
const createConsentEnvelope = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id
    const consentData = { ...req.body, userId }

    const result = await HumanIdentityService.createConsentEnvelope(consentData)

    res.status(201).json({
      success: true,
      message: "Consent envelope created successfully",
      data: result.data,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: "Failed to create consent envelope",
      message: error.message,
    })
  }
})

/**
 * @desc    Verify identity
 * @route   POST /api/human-identity/verify
 * @access  Protected
 */
const verifyIdentity = asyncHandler(async (req, res) => {
  try {
    const { consentEnvelopeId, verificationData } = req.body

    if (!consentEnvelopeId || !verificationData) {
      return res.status(400).json({
        success: false,
        error: "Consent envelope ID and verification data are required",
      })
    }

    const result = await HumanIdentityService.verifyIdentity(consentEnvelopeId, verificationData)

    res.json({
      success: true,
      message: "Identity verification completed",
      data: result,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: "Identity verification failed",
      message: error.message,
    })
  }
})

/**
 * @desc    Create identity declaration
 * @route   POST /api/human-identity/declaration
 * @access  Protected
 */
const createIdentityDeclaration = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id
    const identityData = { ...req.body, userId }

    const result = await HumanIdentityService.createIdentityDeclaration(identityData)

    res.status(201).json({
      success: true,
      message: "Identity declaration created successfully",
      data: result.data,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: "Failed to create identity declaration",
      message: error.message,
    })
  }
})

/**
 * @desc    Get identity declaration
 * @route   GET /api/human-identity/declaration
 * @access  Protected
 */
const getIdentityDeclaration = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id

    const result = await HumanIdentityService.getIdentityDeclaration(userId)

    if (!result.data) {
      return res.status(404).json({
        success: false,
        error: "Identity declaration not found",
      })
    }

    res.json({
      success: true,
      data: result.data,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to get identity declaration",
      message: error.message,
    })
  }
})

/**
 * @desc    Update trust score
 * @route   PUT /api/human-identity/trust-score
 * @access  Protected
 */
const updateTrustScore = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id
    const { behaviorData } = req.body

    const result = await HumanIdentityService.updateTrustScore(userId, behaviorData)

    res.json({
      success: true,
      message: "Trust score updated successfully",
      data: result.data,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: "Failed to update trust score",
      message: error.message,
    })
  }
})

/**
 * @desc    Get consent envelope
 * @route   GET /api/human-identity/consent/:id
 * @access  Protected
 */
const getConsentEnvelope = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const consentEnvelope = await ConsentEnvelope.findOne({
      _id: id,
      userId: userId,
    })

    if (!consentEnvelope) {
      return res.status(404).json({
        success: false,
        error: "Consent envelope not found",
      })
    }

    res.json({
      success: true,
      data: consentEnvelope,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to get consent envelope",
      message: error.message,
    })
  }
})

/**
 * @desc    Verify consent envelope cryptographic proof
 * @route   POST /api/human-identity/consent/verify
 * @access  Protected
 */
const verifyConsentProof = asyncHandler(async (req, res) => {
  try {
    const { consentEnvelopeId } = req.body

    const consentEnvelope = await ConsentEnvelope.findById(consentEnvelopeId)
    if (!consentEnvelope) {
      return res.status(404).json({
        success: false,
        error: "Consent envelope not found",
      })
    }

    const verificationResult = await HumanIdentityService.verifyConsentProof(consentEnvelope)

    res.json({
      success: true,
      data: {
        consentEnvelopeId,
        verification: verificationResult,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to verify consent proof",
      message: error.message,
    })
  }
})

module.exports = {
  createConsentEnvelope,
  verifyIdentity,
  createIdentityDeclaration,
  getIdentityDeclaration,
  updateTrustScore,
  getConsentEnvelope,
  verifyConsentProof,
}
