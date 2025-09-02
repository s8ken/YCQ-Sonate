const crypto = require("crypto")
const jwt = require("jsonwebtoken")
const TrustDeclaration = require("../models/trust.model")
const Agent = require("../models/agent.model")

class TrustProtocolService {
  constructor() {
    this.keyPairs = new Map() // Store key pairs for agents
    this.consensusThreshold = 0.75 // 75% weighted consensus threshold
    this.validators = new Set() // Set of validator agent IDs
  }

  /**
   * Generate RSA key pair for cryptographic signing
   * @param {string} agentId - Agent identifier
   * @returns {Object} Key pair with public/private keys
   */
  generateKeyPair(agentId) {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: "spki",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
      },
    })

    const keyPair = {
      agentId,
      publicKey,
      privateKey,
      keyId: crypto.randomUUID(),
      createdAt: new Date(),
      algorithm: "RS256",
    }

    this.keyPairs.set(agentId, keyPair)
    return keyPair
  }

  /**
   * Sign a trust declaration with RS256
   * @param {Object} trustDeclaration - Trust declaration to sign
   * @param {string} agentId - Agent ID performing the signing
   * @returns {Object} Signed trust declaration with signature
   */
  signTrustDeclaration(trustDeclaration, agentId) {
    let keyPair = this.keyPairs.get(agentId)

    if (!keyPair) {
      keyPair = this.generateKeyPair(agentId)
    }

    // Create payload for signing
    const payload = {
      agent_id: trustDeclaration.agent_id,
      agent_name: trustDeclaration.agent_name,
      declaration_date: trustDeclaration.declaration_date,
      trust_articles: trustDeclaration.trust_articles,
      compliance_score: trustDeclaration.compliance_score,
      guilt_score: trustDeclaration.guilt_score,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60, // 1 year expiry
      iss: "symbi-trust-protocol",
      sub: agentId,
    }

    // Sign with RS256
    const signature = jwt.sign(payload, keyPair.privateKey, {
      algorithm: "RS256",
      keyid: keyPair.keyId,
    })

    return {
      ...trustDeclaration,
      signature,
      keyId: keyPair.keyId,
      signedAt: new Date(),
      signedBy: agentId,
    }
  }

  /**
   * Verify a signed trust declaration
   * @param {Object} signedDeclaration - Signed trust declaration
   * @returns {Object} Verification result
   */
  verifyTrustDeclaration(signedDeclaration) {
    try {
      const { signature, keyId, signedBy } = signedDeclaration

      if (!signature || !keyId || !signedBy) {
        return {
          valid: false,
          error: "Missing signature components",
        }
      }

      const keyPair = this.keyPairs.get(signedBy)
      if (!keyPair || keyPair.keyId !== keyId) {
        return {
          valid: false,
          error: "Invalid key or key not found",
        }
      }

      // Verify JWT signature
      const decoded = jwt.verify(signature, keyPair.publicKey, {
        algorithms: ["RS256"],
      })

      // Verify payload integrity
      const payloadValid = this.verifyPayloadIntegrity(decoded, signedDeclaration)

      return {
        valid: payloadValid,
        decoded,
        verifiedAt: new Date(),
        keyId,
        signedBy,
      }
    } catch (error) {
      return {
        valid: false,
        error: error.message,
      }
    }
  }

  /**
   * Verify payload integrity against declaration
   * @param {Object} decoded - Decoded JWT payload
   * @param {Object} declaration - Original declaration
   * @returns {boolean} Whether payload matches declaration
   */
  verifyPayloadIntegrity(decoded, declaration) {
    const fieldsToCheck = ["agent_id", "agent_name", "compliance_score", "guilt_score"]

    for (const field of fieldsToCheck) {
      if (decoded[field] !== declaration[field]) {
        return false
      }
    }

    // Deep compare trust articles
    const decodedArticles = decoded.trust_articles
    const declarationArticles = declaration.trust_articles

    for (const article in decodedArticles) {
      if (decodedArticles[article] !== declarationArticles[article]) {
        return false
      }
    }

    return true
  }

  /**
   * Get JWKS (JSON Web Key Set) for public key distribution
   * @returns {Object} JWKS format public keys
   */
  getJWKS() {
    const keys = []

    for (const [agentId, keyPair] of this.keyPairs.entries()) {
      // Convert PEM to JWK format
      const publicKeyObj = crypto.createPublicKey(keyPair.publicKey)
      const jwk = publicKeyObj.export({ format: "jwk" })

      keys.push({
        ...jwk,
        kid: keyPair.keyId,
        alg: "RS256",
        use: "sig",
        agent_id: agentId,
        created_at: keyPair.createdAt,
      })
    }

    return {
      keys,
      generated_at: new Date(),
      issuer: "symbi-trust-protocol",
    }
  }

  /**
   * Implement weighted consensus mechanism
   * @param {string} declarationId - Trust declaration ID
   * @param {Array} validatorVotes - Array of validator votes
   * @returns {Object} Consensus result
   */
  async calculateWeightedConsensus(declarationId, validatorVotes) {
    try {
      const declaration = await TrustDeclaration.findById(declarationId)
      if (!declaration) {
        throw new Error("Declaration not found")
      }

      // Get validator weights based on their trust scores
      const validatorWeights = await this.getValidatorWeights(validatorVotes)

      let totalWeight = 0
      let approvalWeight = 0
      const voteDetails = []

      for (const vote of validatorVotes) {
        const weight = validatorWeights[vote.validatorId] || 0
        totalWeight += weight

        if (vote.approved) {
          approvalWeight += weight
        }

        voteDetails.push({
          validatorId: vote.validatorId,
          approved: vote.approved,
          weight,
          timestamp: vote.timestamp,
          reasoning: vote.reasoning,
        })
      }

      const consensusRatio = totalWeight > 0 ? approvalWeight / totalWeight : 0
      const consensusReached = consensusRatio >= this.consensusThreshold

      const consensusResult = {
        declarationId,
        consensusReached,
        consensusRatio,
        threshold: this.consensusThreshold,
        totalWeight,
        approvalWeight,
        voteDetails,
        calculatedAt: new Date(),
      }

      // Update declaration with consensus result
      declaration.consensus = consensusResult
      declaration.consensusReached = consensusReached
      declaration.consensusRatio = consensusRatio
      await declaration.save()

      return consensusResult
    } catch (error) {
      throw new Error(`Consensus calculation failed: ${error.message}`)
    }
  }

  /**
   * Get validator weights based on their trust history
   * @param {Array} validatorVotes - Array of validator votes
   * @returns {Object} Validator weights mapping
   */
  async getValidatorWeights(validatorVotes) {
    const weights = {}

    for (const vote of validatorVotes) {
      try {
        // Get validator's trust history
        const validatorDeclarations = await TrustDeclaration.find({
          agent_id: vote.validatorId,
        })
          .sort({ declaration_date: -1 })
          .limit(10)

        if (validatorDeclarations.length === 0) {
          weights[vote.validatorId] = 0.1 // Minimum weight for new validators
          continue
        }

        // Calculate average compliance score
        const avgCompliance =
          validatorDeclarations.reduce((sum, decl) => sum + decl.compliance_score, 0) / validatorDeclarations.length

        // Calculate weight based on compliance and recency
        const recentDeclaration = validatorDeclarations[0]
        const daysSinceLastDeclaration = (Date.now() - recentDeclaration.declaration_date) / (1000 * 60 * 60 * 24)

        // Weight formula: compliance score * recency factor
        const recencyFactor = Math.max(0.1, 1 - daysSinceLastDeclaration / 365) // Decay over a year
        weights[vote.validatorId] = Math.min(1.0, avgCompliance * recencyFactor)
      } catch (error) {
        console.error(`Error calculating weight for validator ${vote.validatorId}:`, error)
        weights[vote.validatorId] = 0.1 // Default minimum weight
      }
    }

    return weights
  }

  /**
   * Add a validator to the consensus network
   * @param {string} agentId - Agent ID to add as validator
   * @param {Object} requirements - Validator requirements
   * @returns {boolean} Whether validator was added
   */
  async addValidator(agentId, requirements = {}) {
    try {
      // Check if agent meets validator requirements
      const agent = await Agent.findById(agentId)
      if (!agent) {
        throw new Error("Agent not found")
      }

      // Get agent's trust history
      const trustDeclarations = await TrustDeclaration.find({
        agent_id: agentId,
      }).sort({ declaration_date: -1 })

      // Minimum requirements for validators
      const minDeclarations = requirements.minDeclarations || 3
      const minAvgCompliance = requirements.minAvgCompliance || 0.8
      const maxDaysSinceLastDeclaration = requirements.maxDaysSinceLastDeclaration || 90

      if (trustDeclarations.length < minDeclarations) {
        throw new Error("Insufficient trust declarations for validator status")
      }

      const avgCompliance =
        trustDeclarations.reduce((sum, decl) => sum + decl.compliance_score, 0) / trustDeclarations.length

      if (avgCompliance < minAvgCompliance) {
        throw new Error("Average compliance score too low for validator status")
      }

      const daysSinceLastDeclaration = (Date.now() - trustDeclarations[0].declaration_date) / (1000 * 60 * 60 * 24)
      if (daysSinceLastDeclaration > maxDaysSinceLastDeclaration) {
        throw new Error("Last trust declaration too old for validator status")
      }

      // Add to validators set
      this.validators.add(agentId)

      // Generate key pair if not exists
      if (!this.keyPairs.has(agentId)) {
        this.generateKeyPair(agentId)
      }

      return true
    } catch (error) {
      console.error(`Failed to add validator ${agentId}:`, error.message)
      return false
    }
  }

  /**
   * Remove a validator from the consensus network
   * @param {string} agentId - Agent ID to remove
   * @returns {boolean} Whether validator was removed
   */
  removeValidator(agentId) {
    return this.validators.delete(agentId)
  }

  /**
   * Get list of active validators
   * @returns {Array} List of validator agent IDs
   */
  getValidators() {
    return Array.from(this.validators)
  }

  /**
   * Create a trust verification challenge
   * @param {string} challengerId - Agent creating the challenge
   * @param {string} targetAgentId - Agent being challenged
   * @returns {Object} Challenge details
   */
  createTrustChallenge(challengerId, targetAgentId) {
    const challenge = {
      id: crypto.randomUUID(),
      challengerId,
      targetAgentId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      status: "pending",
      challengeType: "trust_verification",
      requirements: {
        minValidators: 3,
        consensusThreshold: this.consensusThreshold,
      },
    }

    return challenge
  }

  /**
   * Validate trust protocol compliance
   * @param {Object} declaration - Trust declaration to validate
   * @returns {Object} Validation result
   */
  validateTrustCompliance(declaration) {
    const violations = []
    const warnings = []

    // Check critical trust articles
    const criticalArticles = ["consent_architecture", "ethical_override"]
    for (const article of criticalArticles) {
      if (!declaration.trust_articles[article]) {
        violations.push({
          type: "critical_violation",
          article,
          message: `Critical trust article '${article}' is not compliant`,
        })
      }
    }

    // Check compliance score thresholds
    if (declaration.compliance_score < 0.6) {
      violations.push({
        type: "low_compliance",
        score: declaration.compliance_score,
        message: "Compliance score below minimum threshold (0.6)",
      })
    }

    // Check guilt score thresholds
    if (declaration.guilt_score > 0.4) {
      warnings.push({
        type: "high_guilt",
        score: declaration.guilt_score,
        message: "Guilt score above recommended threshold (0.4)",
      })
    }

    // Check declaration recency
    const daysSinceDeclaration = (Date.now() - declaration.declaration_date) / (1000 * 60 * 60 * 24)
    if (daysSinceDeclaration > 90) {
      warnings.push({
        type: "stale_declaration",
        daysSince: Math.floor(daysSinceDeclaration),
        message: "Trust declaration is older than 90 days",
      })
    }

    return {
      valid: violations.length === 0,
      violations,
      warnings,
      complianceLevel: this.calculateComplianceLevel(declaration, violations, warnings),
      validatedAt: new Date(),
    }
  }

  /**
   * Calculate overall compliance level
   * @param {Object} declaration - Trust declaration
   * @param {Array} violations - Compliance violations
   * @param {Array} warnings - Compliance warnings
   * @returns {string} Compliance level
   */
  calculateComplianceLevel(declaration, violations, warnings) {
    if (violations.length > 0) {
      return "non_compliant"
    }

    if (warnings.length > 2) {
      return "partially_compliant"
    }

    if (declaration.compliance_score >= 0.9 && declaration.guilt_score <= 0.1) {
      return "fully_compliant"
    }

    if (declaration.compliance_score >= 0.7 && declaration.guilt_score <= 0.3) {
      return "compliant"
    }

    return "minimally_compliant"
  }
}

module.exports = new TrustProtocolService()
