const crypto = require("crypto")
const jwt = require("jsonwebtoken")
const { ConsentEnvelope, HumanIdentityDeclaration } = require("../models/human-identity.model")
const TrustProtocolService = require("./trust-protocol.service")

class HumanIdentityService {
  constructor() {
    this.verificationMethods = {
      email: this.verifyEmail.bind(this),
      phone: this.verifyPhone.bind(this),
      biometric: this.verifyBiometric.bind(this),
      document: this.verifyDocument.bind(this),
      "multi-factor": this.verifyMultiFactor.bind(this),
    }
  }

  /**
   * Create a consent envelope for human identity declaration
   * @param {Object} consentData - Consent envelope data
   * @returns {Object} Created consent envelope
   */
  async createConsentEnvelope(consentData) {
    try {
      const { userId, identityAssertion, consentArticles, verificationMethod, biometricHash } = consentData

      // Validate required consent articles
      const requiredArticles = ["dataProcessing", "aiInteraction", "trustProtocolParticipation", "identityVerification"]

      for (const article of requiredArticles) {
        if (!consentArticles[article]) {
          throw new Error(`Required consent article '${article}' must be accepted`)
        }
      }

      // Create consent envelope
      const consentEnvelope = new ConsentEnvelope({
        userId,
        identityAssertion,
        consentArticles,
        verificationMethod,
        biometricHash,
      })

      // Generate cryptographic proof
      const cryptographicProof = this.generateConsentProof(consentEnvelope)
      consentEnvelope.cryptographicProof = cryptographicProof

      await consentEnvelope.save()

      return {
        success: true,
        data: consentEnvelope,
        message: "Consent envelope created successfully",
      }
    } catch (error) {
      throw new Error(`Failed to create consent envelope: ${error.message}`)
    }
  }

  /**
   * Generate cryptographic proof for consent envelope
   * @param {Object} consentEnvelope - Consent envelope to sign
   * @returns {Object} Cryptographic proof
   */
  generateConsentProof(consentEnvelope) {
    const keyPair = TrustProtocolService.generateKeyPair(`human_${consentEnvelope.userId}`)

    const payload = {
      consentId: consentEnvelope.consentId,
      userId: consentEnvelope.userId,
      identityAssertion: consentEnvelope.identityAssertion,
      consentArticles: consentEnvelope.consentArticles,
      verificationMethod: consentEnvelope.verificationMethod,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(consentEnvelope.expiresAt.getTime() / 1000),
      iss: "symbi-human-identity",
      sub: `human_${consentEnvelope.userId}`,
    }

    const signature = jwt.sign(payload, keyPair.privateKey, {
      algorithm: "RS256",
      keyid: keyPair.keyId,
    })

    return {
      signature,
      keyId: keyPair.keyId,
      algorithm: "RS256",
      signedAt: new Date(),
    }
  }

  /**
   * Verify consent envelope cryptographic proof
   * @param {Object} consentEnvelope - Consent envelope to verify
   * @returns {Object} Verification result
   */
  async verifyConsentProof(consentEnvelope) {
    try {
      const { cryptographicProof } = consentEnvelope

      if (!cryptographicProof || !cryptographicProof.signature) {
        return { valid: false, error: "No cryptographic proof found" }
      }

      // Get the key pair for verification
      const keyPair = TrustProtocolService.keyPairs.get(`human_${consentEnvelope.userId}`)
      if (!keyPair) {
        return { valid: false, error: "Verification key not found" }
      }

      // Verify JWT signature
      const decoded = jwt.verify(cryptographicProof.signature, keyPair.publicKey, {
        algorithms: ["RS256"],
      })

      // Verify payload integrity
      const payloadValid = this.verifyConsentIntegrity(decoded, consentEnvelope)

      return {
        valid: payloadValid,
        decoded,
        verifiedAt: new Date(),
      }
    } catch (error) {
      return {
        valid: false,
        error: error.message,
      }
    }
  }

  /**
   * Verify consent payload integrity
   * @param {Object} decoded - Decoded JWT payload
   * @param {Object} consentEnvelope - Original consent envelope
   * @returns {boolean} Whether payload matches envelope
   */
  verifyConsentIntegrity(decoded, consentEnvelope) {
    const fieldsToCheck = ["consentId", "userId", "identityAssertion", "verificationMethod"]

    for (const field of fieldsToCheck) {
      if (decoded[field] !== consentEnvelope[field]) {
        return false
      }
    }

    // Deep compare consent articles
    for (const article in decoded.consentArticles) {
      if (decoded.consentArticles[article] !== consentEnvelope.consentArticles[article]) {
        return false
      }
    }

    return true
  }

  /**
   * Create human identity declaration
   * @param {Object} identityData - Identity declaration data
   * @returns {Object} Created identity declaration
   */
  async createIdentityDeclaration(identityData) {
    try {
      const { userId, consentEnvelopeId, identityAttributes, trustPreferences, verificationEvidence } = identityData

      // Verify consent envelope exists and is valid
      const consentEnvelope = await ConsentEnvelope.findById(consentEnvelopeId)
      if (!consentEnvelope) {
        throw new Error("Consent envelope not found")
      }

      if (consentEnvelope.verificationStatus !== "verified") {
        throw new Error("Consent envelope must be verified before creating identity declaration")
      }

      // Create identity declaration
      const identityDeclaration = new HumanIdentityDeclaration({
        userId,
        consentEnvelope: consentEnvelopeId,
        identityAttributes,
        trustPreferences,
        verificationEvidence,
        status: "submitted",
      })

      // Calculate initial trust score
      const trustScore = await this.calculateInitialTrustScore(identityDeclaration)
      identityDeclaration.trustScore = trustScore

      await identityDeclaration.save()

      return {
        success: true,
        data: identityDeclaration,
        message: "Identity declaration created successfully",
      }
    } catch (error) {
      throw new Error(`Failed to create identity declaration: ${error.message}`)
    }
  }

  /**
   * Calculate initial trust score for identity declaration
   * @param {Object} identityDeclaration - Identity declaration
   * @returns {Object} Trust score breakdown
   */
  async calculateInitialTrustScore(identityDeclaration) {
    let identityConfidence = 0
    const behavioralConsistency = 0.5 // Default for new users
    const communityReputation = 0.1 // Default for new users

    // Calculate identity confidence based on verification evidence
    const { verificationEvidence } = identityDeclaration
    if (verificationEvidence.documentHash) identityConfidence += 0.4
    if (verificationEvidence.biometricHash) identityConfidence += 0.3
    if (verificationEvidence.thirdPartyVerification) identityConfidence += 0.3

    // Adjust based on identity attributes completeness
    const { identityAttributes } = identityDeclaration
    const requiredFields = ["fullName", "email"]
    const optionalFields = ["phoneNumber", "dateOfBirth", "nationality", "occupation"]

    const completedRequired = requiredFields.filter((field) => identityAttributes[field]).length
    const completedOptional = optionalFields.filter((field) => identityAttributes[field]).length

    const completenessBonus =
      (completedRequired / requiredFields.length) * 0.2 + (completedOptional / optionalFields.length) * 0.1

    identityConfidence = Math.min(1, identityConfidence + completenessBonus)

    // Calculate overall score
    const overallScore = identityConfidence * 0.5 + behavioralConsistency * 0.3 + communityReputation * 0.2

    return {
      identityConfidence,
      behavioralConsistency,
      communityReputation,
      overallScore,
    }
  }

  /**
   * Verify identity using specified method
   * @param {string} consentEnvelopeId - Consent envelope ID
   * @param {Object} verificationData - Verification data
   * @returns {Object} Verification result
   */
  async verifyIdentity(consentEnvelopeId, verificationData) {
    try {
      const consentEnvelope = await ConsentEnvelope.findById(consentEnvelopeId)
      if (!consentEnvelope) {
        throw new Error("Consent envelope not found")
      }

      const verificationMethod = consentEnvelope.verificationMethod
      const verifyFunction = this.verificationMethods[verificationMethod]

      if (!verifyFunction) {
        throw new Error(`Unsupported verification method: ${verificationMethod}`)
      }

      const result = await verifyFunction(consentEnvelope, verificationData)

      if (result.success) {
        consentEnvelope.verificationStatus = "verified"
        await consentEnvelope.save()
      }

      return result
    } catch (error) {
      throw new Error(`Identity verification failed: ${error.message}`)
    }
  }

  /**
   * Email verification method
   * @param {Object} consentEnvelope - Consent envelope
   * @param {Object} verificationData - Verification data
   * @returns {Object} Verification result
   */
  async verifyEmail(consentEnvelope, verificationData) {
    const { verificationCode, email } = verificationData

    // In a real implementation, you would:
    // 1. Send verification email with code
    // 2. Store code temporarily (Redis/cache)
    // 3. Verify code matches

    // Simplified verification for demo
    const isValidCode = verificationCode && verificationCode.length === 6
    const isValidEmail = email && email.includes("@")

    return {
      success: isValidCode && isValidEmail,
      method: "email",
      verifiedAt: new Date(),
      confidence: isValidCode && isValidEmail ? 0.8 : 0,
    }
  }

  /**
   * Phone verification method
   * @param {Object} consentEnvelope - Consent envelope
   * @param {Object} verificationData - Verification data
   * @returns {Object} Verification result
   */
  async verifyPhone(consentEnvelope, verificationData) {
    const { verificationCode, phoneNumber } = verificationData

    // Simplified verification for demo
    const isValidCode = verificationCode && verificationCode.length === 6
    const isValidPhone = phoneNumber && phoneNumber.length >= 10

    return {
      success: isValidCode && isValidPhone,
      method: "phone",
      verifiedAt: new Date(),
      confidence: isValidCode && isValidPhone ? 0.7 : 0,
    }
  }

  /**
   * Biometric verification method
   * @param {Object} consentEnvelope - Consent envelope
   * @param {Object} verificationData - Verification data
   * @returns {Object} Verification result
   */
  async verifyBiometric(consentEnvelope, verificationData) {
    const { biometricHash } = verificationData

    // Compare with stored biometric hash
    const matches = biometricHash === consentEnvelope.biometricHash

    return {
      success: matches,
      method: "biometric",
      verifiedAt: new Date(),
      confidence: matches ? 0.95 : 0,
    }
  }

  /**
   * Document verification method
   * @param {Object} consentEnvelope - Consent envelope
   * @param {Object} verificationData - Verification data
   * @returns {Object} Verification result
   */
  async verifyDocument(consentEnvelope, verificationData) {
    const { documentHash, documentType } = verificationData

    // In a real implementation, you would:
    // 1. Verify document authenticity
    // 2. Extract identity information
    // 3. Cross-reference with government databases

    const isValidDocument = documentHash && documentType

    return {
      success: isValidDocument,
      method: "document",
      verifiedAt: new Date(),
      confidence: isValidDocument ? 0.9 : 0,
    }
  }

  /**
   * Multi-factor verification method
   * @param {Object} consentEnvelope - Consent envelope
   * @param {Object} verificationData - Verification data
   * @returns {Object} Verification result
   */
  async verifyMultiFactor(consentEnvelope, verificationData) {
    const { factors } = verificationData
    let totalConfidence = 0
    let successfulFactors = 0

    for (const factor of factors) {
      const result = await this.verificationMethods[factor.method](consentEnvelope, factor.data)
      if (result.success) {
        successfulFactors++
        totalConfidence += result.confidence
      }
    }

    const success = successfulFactors >= 2 // Require at least 2 factors
    const averageConfidence = successfulFactors > 0 ? totalConfidence / successfulFactors : 0

    return {
      success,
      method: "multi-factor",
      verifiedAt: new Date(),
      confidence: success ? Math.min(0.98, averageConfidence * 1.1) : 0,
      factorsVerified: successfulFactors,
    }
  }

  /**
   * Get human identity declaration by user ID
   * @param {string} userId - User ID
   * @returns {Object} Identity declaration
   */
  async getIdentityDeclaration(userId) {
    try {
      const declaration = await HumanIdentityDeclaration.findOne({ userId }).populate("consentEnvelope").exec()

      return {
        success: true,
        data: declaration,
      }
    } catch (error) {
      throw new Error(`Failed to get identity declaration: ${error.message}`)
    }
  }

  /**
   * Update trust score based on behavior
   * @param {string} userId - User ID
   * @param {Object} behaviorData - Behavior data
   * @returns {Object} Updated trust score
   */
  async updateTrustScore(userId, behaviorData) {
    try {
      const declaration = await HumanIdentityDeclaration.findOne({ userId })
      if (!declaration) {
        throw new Error("Identity declaration not found")
      }

      // Update behavioral consistency based on actions
      const { actions, interactions, violations } = behaviorData

      let behavioralScore = declaration.trustScore.behavioralConsistency

      // Positive actions increase score
      if (actions && actions.positive > 0) {
        behavioralScore += actions.positive * 0.01
      }

      // Violations decrease score
      if (violations && violations.count > 0) {
        behavioralScore -= violations.count * 0.05
      }

      // Consistent interactions improve score
      if (interactions && interactions.consistency > 0.8) {
        behavioralScore += 0.02
      }

      behavioralScore = Math.max(0, Math.min(1, behavioralScore))

      // Recalculate overall score
      const overallScore =
        declaration.trustScore.identityConfidence * 0.5 +
        behavioralScore * 0.3 +
        declaration.trustScore.communityReputation * 0.2

      declaration.trustScore.behavioralConsistency = behavioralScore
      declaration.trustScore.overallScore = overallScore
      await declaration.save()

      return {
        success: true,
        data: declaration.trustScore,
      }
    } catch (error) {
      throw new Error(`Failed to update trust score: ${error.message}`)
    }
  }
}

module.exports = new HumanIdentityService()
