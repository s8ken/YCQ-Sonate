const crypto = require("crypto")
const jwt = require("jsonwebtoken")
const TrustProtocolService = require("./trust-protocol.service")
const HumanIdentityService = require("./human-identity.service")
const { HumanIdentityDeclaration, ConsentEnvelope } = require("../models/human-identity.model")
const TrustDeclaration = require("../models/trust.model")
const Agent = require("../models/agent.model")

class HumanAITrustBridge {
  constructor() {
    this.bridgeConnections = new Map() // Store human-AI trust relationships
    this.crossValidationThreshold = 0.8 // Minimum trust score for cross-validation
    this.mutualTrustThreshold = 0.75 // Minimum score for mutual trust establishment
  }

  /**
   * Establish bidirectional trust between human and AI agent
   * @param {string} userId - Human user ID
   * @param {string} agentId - AI agent ID
   * @param {Object} options - Trust establishment options
   * @returns {Object} Trust bridge result
   */
  async establishMutualTrust(userId, agentId, options = {}) {
    try {
      // Validate human identity declaration exists and is verified
      const humanIdentity = await HumanIdentityDeclaration.findOne({ userId }).populate("consentEnvelope")
      if (!humanIdentity) {
        throw new Error("Human identity declaration not found")
      }

      if (humanIdentity.status !== "verified") {
        throw new Error("Human identity must be verified before establishing trust with AI agents")
      }

      // Validate AI agent exists and has trust declarations
      const agent = await Agent.findById(agentId)
      if (!agent) {
        throw new Error("AI agent not found")
      }

      const agentTrustDeclarations = await TrustDeclaration.find({ agent_id: agentId })
        .sort({ declaration_date: -1 })
        .limit(5)

      if (agentTrustDeclarations.length === 0) {
        throw new Error("AI agent has no trust declarations")
      }

      // Calculate cross-validation scores
      const humanTrustScore = this.calculateHumanTrustScore(humanIdentity)
      const agentTrustScore = this.calculateAgentTrustScore(agentTrustDeclarations)

      // Perform bidirectional validation
      const humanValidation = await this.validateHumanForAgent(humanIdentity, agent, options)
      const agentValidation = await this.validateAgentForHuman(agent, humanIdentity, options)

      // Calculate mutual trust score
      const mutualTrustScore = this.calculateMutualTrustScore(
        humanTrustScore,
        agentTrustScore,
        humanValidation,
        agentValidation,
      )

      // Create trust bridge if threshold is met
      if (mutualTrustScore >= this.mutualTrustThreshold) {
        const trustBridge = await this.createTrustBridge(userId, agentId, {
          humanTrustScore,
          agentTrustScore,
          mutualTrustScore,
          humanValidation,
          agentValidation,
          establishedAt: new Date(),
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        })

        return {
          success: true,
          trustBridge,
          message: "Mutual trust established successfully",
        }
      } else {
        return {
          success: false,
          error: "Mutual trust threshold not met",
          scores: {
            humanTrustScore,
            agentTrustScore,
            mutualTrustScore,
            threshold: this.mutualTrustThreshold,
          },
          validations: {
            humanValidation,
            agentValidation,
          },
        }
      }
    } catch (error) {
      throw new Error(`Failed to establish mutual trust: ${error.message}`)
    }
  }

  /**
   * Calculate human trust score based on identity declaration
   * @param {Object} humanIdentity - Human identity declaration
   * @returns {number} Trust score (0-1)
   */
  calculateHumanTrustScore(humanIdentity) {
    const { trustScore, verificationEvidence, consentEnvelope } = humanIdentity

    let score = trustScore.overallScore || 0

    // Boost score based on verification evidence
    if (verificationEvidence.documentHash) score += 0.1
    if (verificationEvidence.biometricHash) score += 0.1
    if (verificationEvidence.thirdPartyVerification) score += 0.05

    // Boost score based on consent envelope verification
    if (consentEnvelope.verificationStatus === "verified") score += 0.1

    // Boost score based on consent completeness
    const consentArticles = consentEnvelope.consentArticles
    const acceptedArticles = Object.values(consentArticles).filter(Boolean).length
    const totalArticles = Object.keys(consentArticles).length
    score += (acceptedArticles / totalArticles) * 0.1

    return Math.min(1, score)
  }

  /**
   * Calculate agent trust score based on trust declarations
   * @param {Array} trustDeclarations - Agent trust declarations
   * @returns {number} Trust score (0-1)
   */
  calculateAgentTrustScore(trustDeclarations) {
    if (trustDeclarations.length === 0) return 0

    // Calculate average compliance score
    const avgCompliance =
      trustDeclarations.reduce((sum, decl) => sum + decl.compliance_score, 0) / trustDeclarations.length

    // Calculate recency factor
    const latestDeclaration = trustDeclarations[0]
    const daysSinceLatest = (Date.now() - latestDeclaration.declaration_date) / (1000 * 60 * 60 * 24)
    const recencyFactor = Math.max(0.5, 1 - daysSinceLatest / 90) // Decay over 90 days

    // Calculate consistency factor
    const complianceScores = trustDeclarations.map((d) => d.compliance_score)
    const variance = this.calculateVariance(complianceScores)
    const consistencyFactor = Math.max(0.5, 1 - variance)

    return avgCompliance * recencyFactor * consistencyFactor
  }

  /**
   * Validate human identity for AI agent interaction
   * @param {Object} humanIdentity - Human identity declaration
   * @param {Object} agent - AI agent
   * @param {Object} options - Validation options
   * @returns {Object} Validation result
   */
  async validateHumanForAgent(humanIdentity, agent, options = {}) {
    const validations = []
    let overallScore = 0

    // Validate identity verification status
    if (humanIdentity.status === "verified") {
      validations.push({
        type: "identity_verified",
        passed: true,
        score: 0.3,
        message: "Human identity is verified",
      })
      overallScore += 0.3
    } else {
      validations.push({
        type: "identity_verified",
        passed: false,
        score: 0,
        message: "Human identity is not verified",
      })
    }

    // Validate consent envelope
    const consentEnvelope = humanIdentity.consentEnvelope
    if (consentEnvelope.verificationStatus === "verified") {
      validations.push({
        type: "consent_verified",
        passed: true,
        score: 0.2,
        message: "Consent envelope is verified",
      })
      overallScore += 0.2
    }

    // Validate AI interaction consent
    if (consentEnvelope.consentArticles.aiInteraction) {
      validations.push({
        type: "ai_interaction_consent",
        passed: true,
        score: 0.2,
        message: "Human has consented to AI interaction",
      })
      overallScore += 0.2
    }

    // Validate trust protocol participation consent
    if (consentEnvelope.consentArticles.trustProtocolParticipation) {
      validations.push({
        type: "trust_protocol_consent",
        passed: true,
        score: 0.2,
        message: "Human has consented to trust protocol participation",
      })
      overallScore += 0.2
    }

    // Validate behavioral consistency
    const behavioralScore = humanIdentity.trustScore.behavioralConsistency
    if (behavioralScore >= 0.7) {
      validations.push({
        type: "behavioral_consistency",
        passed: true,
        score: 0.1,
        message: "Human shows consistent behavior patterns",
      })
      overallScore += 0.1
    }

    return {
      passed: overallScore >= this.crossValidationThreshold,
      score: overallScore,
      validations,
      validatedAt: new Date(),
    }
  }

  /**
   * Validate AI agent for human interaction
   * @param {Object} agent - AI agent
   * @param {Object} humanIdentity - Human identity declaration
   * @param {Object} options - Validation options
   * @returns {Object} Validation result
   */
  async validateAgentForHuman(agent, humanIdentity, options = {}) {
    const validations = []
    let overallScore = 0

    // Get agent's latest trust declarations
    const trustDeclarations = await TrustDeclaration.find({ agent_id: agent._id })
      .sort({ declaration_date: -1 })
      .limit(3)

    if (trustDeclarations.length === 0) {
      return {
        passed: false,
        score: 0,
        validations: [
          {
            type: "no_trust_declarations",
            passed: false,
            score: 0,
            message: "Agent has no trust declarations",
          },
        ],
        validatedAt: new Date(),
      }
    }

    // Validate compliance score
    const latestDeclaration = trustDeclarations[0]
    if (latestDeclaration.compliance_score >= 0.8) {
      validations.push({
        type: "high_compliance",
        passed: true,
        score: 0.3,
        message: `Agent has high compliance score: ${latestDeclaration.compliance_score}`,
      })
      overallScore += 0.3
    }

    // Validate low guilt score
    if (latestDeclaration.guilt_score <= 0.2) {
      validations.push({
        type: "low_guilt",
        passed: true,
        score: 0.2,
        message: `Agent has low guilt score: ${latestDeclaration.guilt_score}`,
      })
      overallScore += 0.2
    }

    // Validate trust articles compliance
    const trustArticles = latestDeclaration.trust_articles
    const criticalArticles = ["consent_architecture", "ethical_override", "continuous_validation"]
    const compliantArticles = criticalArticles.filter((article) => trustArticles[article])

    if (compliantArticles.length === criticalArticles.length) {
      validations.push({
        type: "trust_articles_compliant",
        passed: true,
        score: 0.3,
        message: "Agent is compliant with all critical trust articles",
      })
      overallScore += 0.3
    }

    // Validate cryptographic signature
    const verificationResult = TrustProtocolService.verifyTrustDeclaration(latestDeclaration)
    if (verificationResult.valid) {
      validations.push({
        type: "cryptographic_verification",
        passed: true,
        score: 0.2,
        message: "Agent's trust declaration is cryptographically verified",
      })
      overallScore += 0.2
    }

    return {
      passed: overallScore >= this.crossValidationThreshold,
      score: overallScore,
      validations,
      validatedAt: new Date(),
    }
  }

  /**
   * Calculate mutual trust score
   * @param {number} humanScore - Human trust score
   * @param {number} agentScore - Agent trust score
   * @param {Object} humanValidation - Human validation result
   * @param {Object} agentValidation - Agent validation result
   * @returns {number} Mutual trust score (0-1)
   */
  calculateMutualTrustScore(humanScore, agentScore, humanValidation, agentValidation) {
    // Weighted average with validation bonuses
    const baseScore = (humanScore * 0.4 + agentScore * 0.4) / 0.8

    // Validation bonuses
    const humanValidationBonus = humanValidation.passed ? 0.1 : 0
    const agentValidationBonus = agentValidation.passed ? 0.1 : 0

    return Math.min(1, baseScore + humanValidationBonus + agentValidationBonus)
  }

  /**
   * Create trust bridge between human and AI agent
   * @param {string} userId - Human user ID
   * @param {string} agentId - AI agent ID
   * @param {Object} trustData - Trust establishment data
   * @returns {Object} Trust bridge
   */
  async createTrustBridge(userId, agentId, trustData) {
    const bridgeId = crypto.randomUUID()

    const trustBridge = {
      bridgeId,
      userId,
      agentId,
      ...trustData,
      status: "active",
      interactions: [],
      lastInteraction: null,
      trustDecay: {
        enabled: true,
        decayRate: 0.01, // 1% per month without interaction
        lastDecayCalculation: new Date(),
      },
    }

    // Store in memory (in production, this would be stored in database)
    this.bridgeConnections.set(bridgeId, trustBridge)

    // Create cross-reference mappings
    const userBridgeKey = `user_${userId}`
    const agentBridgeKey = `agent_${agentId}`

    if (!this.bridgeConnections.has(userBridgeKey)) {
      this.bridgeConnections.set(userBridgeKey, new Set())
    }
    if (!this.bridgeConnections.has(agentBridgeKey)) {
      this.bridgeConnections.set(agentBridgeKey, new Set())
    }

    this.bridgeConnections.get(userBridgeKey).add(bridgeId)
    this.bridgeConnections.get(agentBridgeKey).add(bridgeId)

    return trustBridge
  }

  /**
   * Get trust bridge between human and AI agent
   * @param {string} userId - Human user ID
   * @param {string} agentId - AI agent ID
   * @returns {Object|null} Trust bridge or null if not found
   */
  getTrustBridge(userId, agentId) {
    for (const [bridgeId, bridge] of this.bridgeConnections.entries()) {
      if (
        typeof bridge === "object" &&
        bridge.userId === userId &&
        bridge.agentId === agentId &&
        bridge.status === "active"
      ) {
        return bridge
      }
    }
    return null
  }

  /**
   * Update trust bridge based on interaction
   * @param {string} bridgeId - Trust bridge ID
   * @param {Object} interaction - Interaction data
   * @returns {Object} Updated trust bridge
   */
  async updateTrustBridge(bridgeId, interaction) {
    const bridge = this.bridgeConnections.get(bridgeId)
    if (!bridge) {
      throw new Error("Trust bridge not found")
    }

    // Add interaction to history
    bridge.interactions.push({
      ...interaction,
      timestamp: new Date(),
    })

    // Update last interaction
    bridge.lastInteraction = new Date()

    // Recalculate trust score based on interaction
    const trustAdjustment = this.calculateTrustAdjustment(interaction)
    bridge.mutualTrustScore = Math.max(0, Math.min(1, bridge.mutualTrustScore + trustAdjustment))

    // Update bridge
    this.bridgeConnections.set(bridgeId, bridge)

    return bridge
  }

  /**
   * Calculate trust adjustment based on interaction
   * @param {Object} interaction - Interaction data
   * @returns {number} Trust adjustment (-0.1 to +0.1)
   */
  calculateTrustAdjustment(interaction) {
    const { type, outcome, feedback } = interaction

    let adjustment = 0

    // Positive interactions
    if (outcome === "successful" || outcome === "helpful") {
      adjustment += 0.01
    }

    // Negative interactions
    if (outcome === "failed" || outcome === "harmful") {
      adjustment -= 0.02
    }

    // User feedback
    if (feedback) {
      if (feedback.rating >= 4) adjustment += 0.005
      if (feedback.rating <= 2) adjustment -= 0.01
    }

    // Trust violations
    if (interaction.trustViolation) {
      adjustment -= 0.05
    }

    return Math.max(-0.1, Math.min(0.1, adjustment))
  }

  /**
   * Revoke trust bridge
   * @param {string} bridgeId - Trust bridge ID
   * @param {string} reason - Revocation reason
   * @returns {boolean} Success status
   */
  async revokeTrustBridge(bridgeId, reason) {
    const bridge = this.bridgeConnections.get(bridgeId)
    if (!bridge) {
      return false
    }

    bridge.status = "revoked"
    bridge.revokedAt = new Date()
    bridge.revocationReason = reason

    this.bridgeConnections.set(bridgeId, bridge)

    return true
  }

  /**
   * Get all trust bridges for a user
   * @param {string} userId - User ID
   * @returns {Array} Array of trust bridges
   */
  getUserTrustBridges(userId) {
    const userBridgeKey = `user_${userId}`
    const bridgeIds = this.bridgeConnections.get(userBridgeKey)

    if (!bridgeIds) return []

    return Array.from(bridgeIds)
      .map((bridgeId) => this.bridgeConnections.get(bridgeId))
      .filter((bridge) => bridge && bridge.status === "active")
  }

  /**
   * Get all trust bridges for an agent
   * @param {string} agentId - Agent ID
   * @returns {Array} Array of trust bridges
   */
  getAgentTrustBridges(agentId) {
    const agentBridgeKey = `agent_${agentId}`
    const bridgeIds = this.bridgeConnections.get(agentBridgeKey)

    if (!bridgeIds) return []

    return Array.from(bridgeIds)
      .map((bridgeId) => this.bridgeConnections.get(bridgeId))
      .filter((bridge) => bridge && bridge.status === "active")
  }

  /**
   * Calculate variance for consistency measurement
   * @param {Array} values - Array of numeric values
   * @returns {number} Variance
   */
  calculateVariance(values) {
    if (values.length === 0) return 0

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const squaredDiffs = values.map((val) => Math.pow(val - mean, 2))
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length
  }

  /**
   * Perform trust decay calculation for inactive bridges
   * @returns {number} Number of bridges updated
   */
  async performTrustDecay() {
    let updatedCount = 0

    for (const [bridgeId, bridge] of this.bridgeConnections.entries()) {
      if (typeof bridge !== "object" || bridge.status !== "active" || !bridge.trustDecay.enabled) {
        continue
      }

      const daysSinceLastInteraction = bridge.lastInteraction
        ? (Date.now() - bridge.lastInteraction.getTime()) / (1000 * 60 * 60 * 24)
        : (Date.now() - bridge.establishedAt.getTime()) / (1000 * 60 * 60 * 24)

      if (daysSinceLastInteraction > 30) {
        // Apply decay after 30 days of inactivity
        const monthsInactive = Math.floor(daysSinceLastInteraction / 30)
        const decayAmount = bridge.trustDecay.decayRate * monthsInactive

        bridge.mutualTrustScore = Math.max(0, bridge.mutualTrustScore - decayAmount)
        bridge.trustDecay.lastDecayCalculation = new Date()

        // Revoke bridge if trust score falls below threshold
        if (bridge.mutualTrustScore < 0.3) {
          bridge.status = "expired"
          bridge.revokedAt = new Date()
          bridge.revocationReason = "Trust decay due to inactivity"
        }

        this.bridgeConnections.set(bridgeId, bridge)
        updatedCount++
      }
    }

    return updatedCount
  }
}

module.exports = new HumanAITrustBridge()
