const mongoose = require("mongoose")

const ConsentEnvelopeSchema = new mongoose.Schema({
  consentId: {
    type: String,
    required: true,
    unique: true,
    default: () => require("crypto").randomUUID(),
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  identityAssertion: {
    type: String,
    required: true,
  },
  biometricHash: {
    type: String,
    required: false, // Optional for enhanced security
  },
  consentArticles: {
    dataProcessing: { type: Boolean, required: true },
    aiInteraction: { type: Boolean, required: true },
    trustProtocolParticipation: { type: Boolean, required: true },
    identityVerification: { type: Boolean, required: true },
    consensusParticipation: { type: Boolean, required: true },
    dataRetention: { type: Boolean, required: true },
  },
  cryptographicProof: {
    signature: String,
    keyId: String,
    algorithm: { type: String, default: "RS256" },
    signedAt: Date,
  },
  verificationStatus: {
    type: String,
    enum: ["pending", "verified", "rejected", "expired"],
    default: "pending",
  },
  verificationMethod: {
    type: String,
    enum: ["email", "phone", "biometric", "document", "multi-factor"],
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

const HumanIdentityDeclarationSchema = new mongoose.Schema({
  declarationId: {
    type: String,
    required: true,
    unique: true,
    default: () => require("crypto").randomUUID(),
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  consentEnvelope: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ConsentEnvelope",
    required: true,
  },
  identityAttributes: {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: String,
    dateOfBirth: Date,
    nationality: String,
    occupation: String,
    organizationAffiliation: String,
  },
  trustPreferences: {
    aiInteractionLevel: {
      type: String,
      enum: ["minimal", "moderate", "extensive", "full"],
      default: "moderate",
    },
    dataPrivacyLevel: {
      type: String,
      enum: ["strict", "balanced", "permissive"],
      default: "balanced",
    },
    consensusParticipation: {
      type: Boolean,
      default: false,
    },
    validatorRole: {
      type: Boolean,
      default: false,
    },
  },
  verificationEvidence: {
    documentType: String,
    documentHash: String,
    biometricHash: String,
    thirdPartyVerification: String,
  },
  trustScore: {
    identityConfidence: { type: Number, min: 0, max: 1, default: 0 },
    behavioralConsistency: { type: Number, min: 0, max: 1, default: 0 },
    communityReputation: { type: Number, min: 0, max: 1, default: 0 },
    overallScore: { type: Number, min: 0, max: 1, default: 0 },
  },
  status: {
    type: String,
    enum: ["draft", "submitted", "under_review", "verified", "rejected", "suspended"],
    default: "draft",
  },
  reviewHistory: [
    {
      reviewerId: String,
      action: String,
      reasoning: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Middleware to update timestamps
ConsentEnvelopeSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

HumanIdentityDeclarationSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

// Indexes for performance
ConsentEnvelopeSchema.index({ userId: 1, verificationStatus: 1 })
ConsentEnvelopeSchema.index({ expiresAt: 1 })
HumanIdentityDeclarationSchema.index({ userId: 1, status: 1 })
HumanIdentityDeclarationSchema.index({ "trustScore.overallScore": -1 })

const ConsentEnvelope = mongoose.model("ConsentEnvelope", ConsentEnvelopeSchema)
const HumanIdentityDeclaration = mongoose.model("HumanIdentityDeclaration", HumanIdentityDeclarationSchema)

module.exports = {
  ConsentEnvelope,
  HumanIdentityDeclaration,
}
