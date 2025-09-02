const express = require("express")
const router = express.Router()
const {
  signTrustDeclaration,
  verifyTrustDeclaration,
  getJWKS,
  submitConsensusVote,
  calculateConsensus,
  addValidator,
  getValidators,
  validateCompliance,
  createTrustChallenge,
} = require("../controllers/trust-protocol.controller")
const { protect } = require("../middleware/auth.middleware")

// Cryptographic signing routes
router.post("/sign", protect, signTrustDeclaration)
router.post("/verify", protect, verifyTrustDeclaration)
router.get("/jwks", getJWKS) // Public endpoint for JWKS

// Consensus mechanism routes
router.post("/consensus/vote", protect, submitConsensusVote)
router.post("/consensus/calculate", protect, calculateConsensus)

// Validator management routes
router.post("/validators", protect, addValidator)
router.get("/validators", protect, getValidators)

// Trust validation routes
router.post("/validate", protect, validateCompliance)
router.post("/challenge", protect, createTrustChallenge)

module.exports = router
