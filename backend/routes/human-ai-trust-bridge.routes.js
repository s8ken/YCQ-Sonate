const express = require("express")
const router = express.Router()
const {
  establishMutualTrust,
  getTrustBridge,
  getUserTrustBridges,
  updateTrustBridge,
  revokeTrustBridge,
} = require("../controllers/human-ai-trust-bridge.controller")
const { protect } = require("../middleware/auth.middleware")

// Trust bridge establishment
router.post("/establish", protect, establishMutualTrust)

// Trust bridge management
router.get("/", protect, getUserTrustBridges)
router.get("/:agentId", protect, getTrustBridge)
router.put("/:bridgeId/interaction", protect, updateTrustBridge)
router.delete("/:bridgeId", protect, revokeTrustBridge)

module.exports = router
