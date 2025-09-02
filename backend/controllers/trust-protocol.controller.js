const asyncHandler = require("express-async-handler")
const TrustProtocolService = require("../services/trust-protocol.service")
const TrustDeclaration = require("../models/trust.model")

/**
 * @desc    Sign a trust declaration
 * @route   POST /api/trust-protocol/sign
 * @access  Protected
 */
const signTrustDeclaration = asyncHandler(async (req, res) => {
  try {
    const { declarationId, agentId } = req.body

    if (!declarationId || !agentId) {
      return res.status(400).json({
        success: false,
        error: "Declaration ID and Agent ID are required",
      })
    }

    const declaration = await TrustDeclaration.findById(declarationId)
    if (!declaration) {
      return res.status(404).json({
        success: false,
        error: "Trust declaration not found",
      })
    }

    // Sign the declaration
    const signedDeclaration = TrustProtocolService.signTrustDeclaration(declaration.toObject(), agentId)

    // Update the declaration with signature
    declaration.signature = signedDeclaration.signature
    declaration.keyId = signedDeclaration.keyId
    declaration.signedAt = signedDeclaration.signedAt
    declaration.signedBy = signedDeclaration.signedBy
    await declaration.save()

    res.json({
      success: true,
      message: "Trust declaration signed successfully",
      data: {
        declarationId,
        signature: signedDeclaration.signature,
        keyId: signedDeclaration.keyId,
        signedAt: signedDeclaration.signedAt,
        signedBy: signedDeclaration.signedBy,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to sign trust declaration",
      message: error.message,
    })
  }
})

/**
 * @desc    Verify a signed trust declaration
 * @route   POST /api/trust-protocol/verify
 * @access  Protected
 */
const verifyTrustDeclaration = asyncHandler(async (req, res) => {
  try {
    const { declarationId } = req.body

    if (!declarationId) {
      return res.status(400).json({
        success: false,
        error: "Declaration ID is required",
      })
    }

    const declaration = await TrustDeclaration.findById(declarationId)
    if (!declaration) {
      return res.status(404).json({
        success: false,
        error: "Trust declaration not found",
      })
    }

    if (!declaration.signature) {
      return res.status(400).json({
        success: false,
        error: "Declaration is not signed",
      })
    }

    // Verify the signature
    const verificationResult = TrustProtocolService.verifyTrustDeclaration(declaration.toObject())

    res.json({
      success: true,
      data: {
        declarationId,
        verification: verificationResult,
        declaration: {
          agent_id: declaration.agent_id,
          agent_name: declaration.agent_name,
          compliance_score: declaration.compliance_score,
          guilt_score: declaration.guilt_score,
          signedBy: declaration.signedBy,
          signedAt: declaration.signedAt,
        },
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to verify trust declaration",
      message: error.message,
    })
  }
})

/**
 * @desc    Get JWKS (JSON Web Key Set)
 * @route   GET /api/trust-protocol/jwks
 * @access  Public
 */
const getJWKS = asyncHandler(async (req, res) => {
  try {
    const jwks = TrustProtocolService.getJWKS()

    res.json(jwks)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to retrieve JWKS",
      message: error.message,
    })
  }
})

/**
 * @desc    Submit validator vote for consensus
 * @route   POST /api/trust-protocol/consensus/vote
 * @access  Protected
 */
const submitConsensusVote = asyncHandler(async (req, res) => {
  try {
    const { declarationId, approved, reasoning } = req.body
    const validatorId = req.user.id // Assuming user is authenticated

    if (!declarationId || approved === undefined) {
      return res.status(400).json({
        success: false,
        error: "Declaration ID and approval status are required",
      })
    }

    // Check if user is a validator
    const validators = TrustProtocolService.getValidators()
    if (!validators.includes(validatorId)) {
      return res.status(403).json({
        success: false,
        error: "User is not authorized as a validator",
      })
    }

    // Store the vote (in a real implementation, you'd store this in a database)
    const vote = {
      validatorId,
      declarationId,
      approved,
      reasoning,
      timestamp: new Date(),
    }

    res.json({
      success: true,
      message: "Consensus vote submitted successfully",
      data: vote,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to submit consensus vote",
      message: error.message,
    })
  }
})

/**
 * @desc    Calculate weighted consensus for a declaration
 * @route   POST /api/trust-protocol/consensus/calculate
 * @access  Protected
 */
const calculateConsensus = asyncHandler(async (req, res) => {
  try {
    const { declarationId, validatorVotes } = req.body

    if (!declarationId || !validatorVotes || !Array.isArray(validatorVotes)) {
      return res.status(400).json({
        success: false,
        error: "Declaration ID and validator votes array are required",
      })
    }

    const consensusResult = await TrustProtocolService.calculateWeightedConsensus(declarationId, validatorVotes)

    res.json({
      success: true,
      message: "Consensus calculated successfully",
      data: consensusResult,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to calculate consensus",
      message: error.message,
    })
  }
})

/**
 * @desc    Add a validator to the network
 * @route   POST /api/trust-protocol/validators
 * @access  Protected (Admin only)
 */
const addValidator = asyncHandler(async (req, res) => {
  try {
    const { agentId, requirements } = req.body

    if (!agentId) {
      return res.status(400).json({
        success: false,
        error: "Agent ID is required",
      })
    }

    const success = await TrustProtocolService.addValidator(agentId, requirements)

    if (success) {
      res.json({
        success: true,
        message: "Validator added successfully",
        data: { agentId, addedAt: new Date() },
      })
    } else {
      res.status(400).json({
        success: false,
        error: "Failed to add validator - requirements not met",
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to add validator",
      message: error.message,
    })
  }
})

/**
 * @desc    Get list of validators
 * @route   GET /api/trust-protocol/validators
 * @access  Protected
 */
const getValidators = asyncHandler(async (req, res) => {
  try {
    const validators = TrustProtocolService.getValidators()

    res.json({
      success: true,
      data: {
        validators,
        count: validators.length,
        retrievedAt: new Date(),
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to retrieve validators",
      message: error.message,
    })
  }
})

/**
 * @desc    Validate trust protocol compliance
 * @route   POST /api/trust-protocol/validate
 * @access  Protected
 */
const validateCompliance = asyncHandler(async (req, res) => {
  try {
    const { declarationId } = req.body

    if (!declarationId) {
      return res.status(400).json({
        success: false,
        error: "Declaration ID is required",
      })
    }

    const declaration = await TrustDeclaration.findById(declarationId)
    if (!declaration) {
      return res.status(404).json({
        success: false,
        error: "Trust declaration not found",
      })
    }

    const validationResult = TrustProtocolService.validateTrustCompliance(declaration.toObject())

    res.json({
      success: true,
      data: {
        declarationId,
        validation: validationResult,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to validate compliance",
      message: error.message,
    })
  }
})

/**
 * @desc    Create a trust verification challenge
 * @route   POST /api/trust-protocol/challenge
 * @access  Protected
 */
const createTrustChallenge = asyncHandler(async (req, res) => {
  try {
    const { targetAgentId } = req.body
    const challengerId = req.user.id

    if (!targetAgentId) {
      return res.status(400).json({
        success: false,
        error: "Target agent ID is required",
      })
    }

    const challenge = TrustProtocolService.createTrustChallenge(challengerId, targetAgentId)

    res.json({
      success: true,
      message: "Trust challenge created successfully",
      data: challenge,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to create trust challenge",
      message: error.message,
    })
  }
})

module.exports = {
  signTrustDeclaration,
  verifyTrustDeclaration,
  getJWKS,
  submitConsensusVote,
  calculateConsensus,
  addValidator,
  getValidators,
  validateCompliance,
  createTrustChallenge,
}
