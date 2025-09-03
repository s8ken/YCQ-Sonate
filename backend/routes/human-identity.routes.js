const express = require("express")
const router = express.Router()
const {
  createConsentEnvelope,
  verifyIdentity,
  createIdentityDeclaration,
  getIdentityDeclaration,
  updateTrustScore,
  getConsentEnvelope,
  verifyConsentProof,
} = require("../controllers/human-identity.controller")
const { protect } = require("../middleware/auth.middleware")

// Consent envelope routes
router.post("/consent", protect, createConsentEnvelope)
router.get("/consent/:id", protect, getConsentEnvelope)
router.post("/consent/verify", protect, verifyConsentProof)

// Identity verification routes
router.post("/verify", protect, verifyIdentity)

// Identity declaration routes
router.post("/declaration", protect, createIdentityDeclaration)
router.get("/declaration", protect, getIdentityDeclaration)

// Trust score management
router.put("/trust-score", protect, updateTrustScore)

module.exports = router
