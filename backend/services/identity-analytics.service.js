const { HumanIdentityDeclaration, ConsentEnvelope } = require("../models/human-identity.model")
const TrustDeclaration = require("../models/trust.model")
const HumanAITrustBridge = require("./human-ai-trust-bridge.service")

class IdentityAnalyticsService {
  constructor() {
    this.metricsCache = new Map()
    this.cacheExpiry = 5 * 60 * 1000 // 5 minutes
  }

  /**
   * Get comprehensive identity verification analytics
   * @param {Object} filters - Analytics filters (dateRange, verificationMethod, etc.)
   * @returns {Object} Analytics data
   */
  async getIdentityVerificationAnalytics(filters = {}) {
    try {
      const cacheKey = `identity_analytics_${JSON.stringify(filters)}`
      const cached = this.getCachedMetrics(cacheKey)
      if (cached) return cached

      const { startDate, endDate, verificationMethod } = filters
      const dateFilter = this.buildDateFilter(startDate, endDate)

      // Base queries
      const consentEnvelopeQuery = { ...dateFilter }
      const identityDeclarationQuery = { ...dateFilter }

      if (verificationMethod) {
        consentEnvelopeQuery.verificationMethod = verificationMethod
      }

      // Fetch data
      const [consentEnvelopes, identityDeclarations, trustBridges] = await Promise.all([
        ConsentEnvelope.find(consentEnvelopeQuery),
        HumanIdentityDeclaration.find(identityDeclarationQuery),
        this.getTrustBridgeAnalytics(filters),
      ])

      // Calculate metrics
      const analytics = {
        overview: this.calculateOverviewMetrics(consentEnvelopes, identityDeclarations),
        verificationMethods: this.analyzeVerificationMethods(consentEnvelopes),
        trustScores: this.analyzeTrustScores(identityDeclarations),
        timeSeriesData: await this.generateTimeSeriesData(dateFilter),
        conversionFunnel: this.calculateConversionFunnel(consentEnvelopes, identityDeclarations),
        riskAnalysis: this.performRiskAnalysis(consentEnvelopes, identityDeclarations),
        trustBridgeMetrics: trustBridges,
        generatedAt: new Date(),
      }

      this.setCachedMetrics(cacheKey, analytics)
      return analytics
    } catch (error) {
      throw new Error(`Failed to generate identity analytics: ${error.message}`)
    }
  }

  /**
   * Calculate overview metrics
   * @param {Array} consentEnvelopes - Consent envelopes
   * @param {Array} identityDeclarations - Identity declarations
   * @returns {Object} Overview metrics
   */
  calculateOverviewMetrics(consentEnvelopes, identityDeclarations) {
    const totalEnvelopes = consentEnvelopes.length
    const verifiedEnvelopes = consentEnvelopes.filter((e) => e.verificationStatus === "verified").length
    const totalDeclarations = identityDeclarations.length
    const verifiedDeclarations = identityDeclarations.filter((d) => d.status === "verified").length

    return {
      totalConsentEnvelopes: totalEnvelopes,
      verifiedConsentEnvelopes: verifiedEnvelopes,
      consentVerificationRate: totalEnvelopes > 0 ? (verifiedEnvelopes / totalEnvelopes) * 100 : 0,
      totalIdentityDeclarations: totalDeclarations,
      verifiedIdentityDeclarations: verifiedDeclarations,
      identityVerificationRate: totalDeclarations > 0 ? (verifiedDeclarations / totalDeclarations) * 100 : 0,
      averageTimeToVerification: this.calculateAverageVerificationTime(consentEnvelopes),
      failureRate: this.calculateFailureRate(consentEnvelopes, identityDeclarations),
    }
  }

  /**
   * Analyze verification methods usage and success rates
   * @param {Array} consentEnvelopes - Consent envelopes
   * @returns {Object} Verification method analysis
   */
  analyzeVerificationMethods(consentEnvelopes) {
    const methodStats = {}

    consentEnvelopes.forEach((envelope) => {
      const method = envelope.verificationMethod
      if (!methodStats[method]) {
        methodStats[method] = {
          total: 0,
          verified: 0,
          pending: 0,
          rejected: 0,
          expired: 0,
        }
      }

      methodStats[method].total++
      methodStats[method][envelope.verificationStatus]++
    })

    // Calculate success rates and add metadata
    Object.keys(methodStats).forEach((method) => {
      const stats = methodStats[method]
      stats.successRate = stats.total > 0 ? (stats.verified / stats.total) * 100 : 0
      stats.failureRate = stats.total > 0 ? (stats.rejected / stats.total) * 100 : 0
      stats.pendingRate = stats.total > 0 ? (stats.pending / stats.total) * 100 : 0
    })

    return {
      methodBreakdown: methodStats,
      mostPopularMethod: this.getMostPopularMethod(methodStats),
      highestSuccessRateMethod: this.getHighestSuccessRateMethod(methodStats),
      recommendations: this.generateMethodRecommendations(methodStats),
    }
  }

  /**
   * Analyze trust scores distribution and trends
   * @param {Array} identityDeclarations - Identity declarations
   * @returns {Object} Trust score analysis
   */
  analyzeTrustScores(identityDeclarations) {
    const scores = identityDeclarations.map((d) => d.trustScore)

    const overallScores = scores.map((s) => s.overallScore).filter((s) => s !== undefined)
    const identityConfidenceScores = scores.map((s) => s.identityConfidence).filter((s) => s !== undefined)
    const behavioralScores = scores.map((s) => s.behavioralConsistency).filter((s) => s !== undefined)
    const reputationScores = scores.map((s) => s.communityReputation).filter((s) => s !== undefined)

    return {
      overallTrustScore: {
        average: this.calculateAverage(overallScores),
        median: this.calculateMedian(overallScores),
        distribution: this.calculateDistribution(overallScores),
        trend: this.calculateTrend(overallScores),
      },
      identityConfidence: {
        average: this.calculateAverage(identityConfidenceScores),
        distribution: this.calculateDistribution(identityConfidenceScores),
      },
      behavioralConsistency: {
        average: this.calculateAverage(behavioralScores),
        distribution: this.calculateDistribution(behavioralScores),
      },
      communityReputation: {
        average: this.calculateAverage(reputationScores),
        distribution: this.calculateDistribution(reputationScores),
      },
      riskSegmentation: this.segmentByRisk(overallScores),
    }
  }

  /**
   * Generate time series data for trends
   * @param {Object} dateFilter - Date filter object
   * @returns {Array} Time series data points
   */
  async generateTimeSeriesData(dateFilter) {
    const timeSeriesData = []
    const startDate = dateFilter.createdAt?.$gte || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const endDate = dateFilter.createdAt?.$lte || new Date()

    // Generate daily data points
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dayStart = new Date(currentDate)
      const dayEnd = new Date(currentDate)
      dayEnd.setHours(23, 59, 59, 999)

      const [dailyEnvelopes, dailyDeclarations] = await Promise.all([
        ConsentEnvelope.find({
          createdAt: { $gte: dayStart, $lte: dayEnd },
        }),
        HumanIdentityDeclaration.find({
          createdAt: { $gte: dayStart, $lte: dayEnd },
        }),
      ])

      timeSeriesData.push({
        date: dayStart.toISOString().split("T")[0],
        consentEnvelopes: dailyEnvelopes.length,
        verifiedEnvelopes: dailyEnvelopes.filter((e) => e.verificationStatus === "verified").length,
        identityDeclarations: dailyDeclarations.length,
        verifiedDeclarations: dailyDeclarations.filter((d) => d.status === "verified").length,
        averageTrustScore: this.calculateAverage(
          dailyDeclarations.map((d) => d.trustScore.overallScore).filter((s) => s !== undefined),
        ),
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return timeSeriesData
  }

  /**
   * Calculate conversion funnel metrics
   * @param {Array} consentEnvelopes - Consent envelopes
   * @param {Array} identityDeclarations - Identity declarations
   * @returns {Object} Conversion funnel data
   */
  calculateConversionFunnel(consentEnvelopes, identityDeclarations) {
    const totalVisitors = consentEnvelopes.length * 1.2 // Assume 20% drop-off before consent
    const consentCreated = consentEnvelopes.length
    const consentVerified = consentEnvelopes.filter((e) => e.verificationStatus === "verified").length
    const declarationCreated = identityDeclarations.length
    const declarationVerified = identityDeclarations.filter((d) => d.status === "verified").length

    return {
      stages: [
        {
          name: "Visitors",
          count: Math.round(totalVisitors),
          conversionRate: 100,
        },
        {
          name: "Consent Created",
          count: consentCreated,
          conversionRate: totalVisitors > 0 ? (consentCreated / totalVisitors) * 100 : 0,
        },
        {
          name: "Consent Verified",
          count: consentVerified,
          conversionRate: consentCreated > 0 ? (consentVerified / consentCreated) * 100 : 0,
        },
        {
          name: "Declaration Created",
          count: declarationCreated,
          conversionRate: consentVerified > 0 ? (declarationCreated / consentVerified) * 100 : 0,
        },
        {
          name: "Declaration Verified",
          count: declarationVerified,
          conversionRate: declarationCreated > 0 ? (declarationVerified / declarationCreated) * 100 : 0,
        },
      ],
      overallConversionRate: totalVisitors > 0 ? (declarationVerified / totalVisitors) * 100 : 0,
      dropOffPoints: this.identifyDropOffPoints(
        totalVisitors,
        consentCreated,
        consentVerified,
        declarationCreated,
        declarationVerified,
      ),
    }
  }

  /**
   * Perform risk analysis on identity data
   * @param {Array} consentEnvelopes - Consent envelopes
   * @param {Array} identityDeclarations - Identity declarations
   * @returns {Object} Risk analysis results
   */
  performRiskAnalysis(consentEnvelopes, identityDeclarations) {
    const riskFactors = []

    // High rejection rate
    const rejectionRate = this.calculateRejectionRate(consentEnvelopes)
    if (rejectionRate > 15) {
      riskFactors.push({
        type: "high_rejection_rate",
        severity: "high",
        value: rejectionRate,
        description: `Rejection rate of ${rejectionRate.toFixed(1)}% is above normal threshold`,
        recommendation: "Review verification criteria and user experience",
      })
    }

    // Low trust scores
    const lowTrustScoreCount = identityDeclarations.filter((d) => d.trustScore.overallScore < 0.5).length
    const lowTrustScoreRate =
      identityDeclarations.length > 0 ? (lowTrustScoreCount / identityDeclarations.length) * 100 : 0

    if (lowTrustScoreRate > 20) {
      riskFactors.push({
        type: "low_trust_scores",
        severity: "medium",
        value: lowTrustScoreRate,
        description: `${lowTrustScoreRate.toFixed(1)}% of users have low trust scores`,
        recommendation: "Implement trust score improvement programs",
      })
    }

    // Suspicious patterns
    const suspiciousPatterns = this.detectSuspiciousPatterns(consentEnvelopes, identityDeclarations)
    riskFactors.push(...suspiciousPatterns)

    return {
      overallRiskLevel: this.calculateOverallRiskLevel(riskFactors),
      riskFactors,
      mitigationStrategies: this.generateMitigationStrategies(riskFactors),
      monitoringRecommendations: this.generateMonitoringRecommendations(riskFactors),
    }
  }

  /**
   * Get trust bridge analytics
   * @param {Object} filters - Analytics filters
   * @returns {Object} Trust bridge metrics
   */
  async getTrustBridgeAnalytics(filters = {}) {
    // Get all trust bridges (in a real implementation, this would query the database)
    const allBridges = []
    for (const [key, bridge] of HumanAITrustBridge.bridgeConnections.entries()) {
      if (typeof bridge === "object" && bridge.bridgeId) {
        allBridges.push(bridge)
      }
    }

    const activeBridges = allBridges.filter((b) => b.status === "active")
    const totalInteractions = allBridges.reduce((sum, b) => sum + (b.interactions?.length || 0), 0)

    return {
      totalBridges: allBridges.length,
      activeBridges: activeBridges.length,
      averageTrustScore: this.calculateAverage(activeBridges.map((b) => b.mutualTrustScore)),
      totalInteractions,
      averageInteractionsPerBridge: activeBridges.length > 0 ? totalInteractions / activeBridges.length : 0,
      bridgeHealthDistribution: this.analyzeBridgeHealth(activeBridges),
      interactionPatterns: this.analyzeInteractionPatterns(allBridges),
    }
  }

  // Helper methods
  buildDateFilter(startDate, endDate) {
    const filter = {}
    if (startDate || endDate) {
      filter.createdAt = {}
      if (startDate) filter.createdAt.$gte = new Date(startDate)
      if (endDate) filter.createdAt.$lte = new Date(endDate)
    }
    return filter
  }

  calculateAverage(numbers) {
    if (numbers.length === 0) return 0
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length
  }

  calculateMedian(numbers) {
    if (numbers.length === 0) return 0
    const sorted = [...numbers].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
  }

  calculateDistribution(numbers) {
    const ranges = [
      { min: 0, max: 0.2, label: "Very Low" },
      { min: 0.2, max: 0.4, label: "Low" },
      { min: 0.4, max: 0.6, label: "Medium" },
      { min: 0.6, max: 0.8, label: "High" },
      { min: 0.8, max: 1.0, label: "Very High" },
    ]

    return ranges.map((range) => ({
      ...range,
      count: numbers.filter((n) => n >= range.min && n < range.max).length,
      percentage:
        numbers.length > 0 ? (numbers.filter((n) => n >= range.min && n < range.max).length / numbers.length) * 100 : 0,
    }))
  }

  calculateTrend(numbers) {
    if (numbers.length < 2) return "stable"
    const recent = numbers.slice(-Math.ceil(numbers.length / 3))
    const earlier = numbers.slice(0, Math.floor(numbers.length / 3))
    const recentAvg = this.calculateAverage(recent)
    const earlierAvg = this.calculateAverage(earlier)
    const change = ((recentAvg - earlierAvg) / earlierAvg) * 100

    if (change > 5) return "increasing"
    if (change < -5) return "decreasing"
    return "stable"
  }

  getCachedMetrics(key) {
    const cached = this.metricsCache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data
    }
    return null
  }

  setCachedMetrics(key, data) {
    this.metricsCache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }

  calculateAverageVerificationTime(envelopes) {
    const verifiedEnvelopes = envelopes.filter((e) => e.verificationStatus === "verified" && e.updatedAt)
    if (verifiedEnvelopes.length === 0) return 0

    const totalTime = verifiedEnvelopes.reduce((sum, envelope) => {
      const createdAt = new Date(envelope.createdAt)
      const verifiedAt = new Date(envelope.updatedAt)
      return sum + (verifiedAt.getTime() - createdAt.getTime())
    }, 0)

    return totalTime / verifiedEnvelopes.length / (1000 * 60 * 60) // Convert to hours
  }

  calculateFailureRate(envelopes, declarations) {
    const totalAttempts = envelopes.length + declarations.length
    const failures =
      envelopes.filter((e) => e.verificationStatus === "rejected").length +
      declarations.filter((d) => d.status === "rejected").length

    return totalAttempts > 0 ? (failures / totalAttempts) * 100 : 0
  }

  getMostPopularMethod(methodStats) {
    return (
      Object.entries(methodStats).reduce(
        (max, [method, stats]) => (stats.total > (max.stats?.total || 0) ? { method, stats } : max),
        {},
      ).method || "none"
    )
  }

  getHighestSuccessRateMethod(methodStats) {
    return (
      Object.entries(methodStats).reduce(
        (max, [method, stats]) => (stats.successRate > (max.stats?.successRate || 0) ? { method, stats } : max),
        {},
      ).method || "none"
    )
  }

  generateMethodRecommendations(methodStats) {
    const recommendations = []

    Object.entries(methodStats).forEach(([method, stats]) => {
      if (stats.successRate < 70) {
        recommendations.push(
          `Improve ${method} verification process - current success rate: ${stats.successRate.toFixed(1)}%`,
        )
      }
      if (stats.total < 10) {
        recommendations.push(`Consider promoting ${method} verification - low usage detected`)
      }
    })

    return recommendations
  }

  segmentByRisk(scores) {
    return {
      lowRisk: scores.filter((s) => s >= 0.8).length,
      mediumRisk: scores.filter((s) => s >= 0.5 && s < 0.8).length,
      highRisk: scores.filter((s) => s < 0.5).length,
    }
  }

  identifyDropOffPoints(visitors, consentCreated, consentVerified, declarationCreated, declarationVerified) {
    const dropOffs = []

    const consentDropOff = ((visitors - consentCreated) / visitors) * 100
    if (consentDropOff > 30) {
      dropOffs.push({ stage: "Consent Creation", dropOffRate: consentDropOff, severity: "high" })
    }

    const verificationDropOff = ((consentCreated - consentVerified) / consentCreated) * 100
    if (verificationDropOff > 25) {
      dropOffs.push({ stage: "Consent Verification", dropOffRate: verificationDropOff, severity: "medium" })
    }

    return dropOffs
  }

  calculateRejectionRate(envelopes) {
    const rejected = envelopes.filter((e) => e.verificationStatus === "rejected").length
    return envelopes.length > 0 ? (rejected / envelopes.length) * 100 : 0
  }

  detectSuspiciousPatterns(envelopes, declarations) {
    const patterns = []

    // Check for rapid-fire submissions
    const recentSubmissions = envelopes.filter(
      (e) => Date.now() - new Date(e.createdAt).getTime() < 60 * 60 * 1000, // Last hour
    )

    if (recentSubmissions.length > 10) {
      patterns.push({
        type: "rapid_submissions",
        severity: "medium",
        value: recentSubmissions.length,
        description: `${recentSubmissions.length} submissions in the last hour`,
        recommendation: "Implement rate limiting and review for potential abuse",
      })
    }

    return patterns
  }

  calculateOverallRiskLevel(riskFactors) {
    if (riskFactors.some((f) => f.severity === "high")) return "high"
    if (riskFactors.some((f) => f.severity === "medium")) return "medium"
    return "low"
  }

  generateMitigationStrategies(riskFactors) {
    return riskFactors.map((factor) => factor.recommendation).filter((rec, index, arr) => arr.indexOf(rec) === index)
  }

  generateMonitoringRecommendations(riskFactors) {
    const recommendations = [
      "Monitor verification success rates daily",
      "Set up alerts for unusual patterns",
      "Review trust score distributions weekly",
    ]

    if (riskFactors.some((f) => f.type === "high_rejection_rate")) {
      recommendations.push("Implement real-time rejection rate monitoring")
    }

    return recommendations
  }

  analyzeBridgeHealth(bridges) {
    return {
      healthy: bridges.filter((b) => b.mutualTrustScore >= 0.8).length,
      moderate: bridges.filter((b) => b.mutualTrustScore >= 0.6 && b.mutualTrustScore < 0.8).length,
      poor: bridges.filter((b) => b.mutualTrustScore < 0.6).length,
    }
  }

  analyzeInteractionPatterns(bridges) {
    const allInteractions = bridges.flatMap((b) => b.interactions || [])
    const successfulInteractions = allInteractions.filter((i) => i.outcome === "successful").length

    return {
      totalInteractions: allInteractions.length,
      successRate: allInteractions.length > 0 ? (successfulInteractions / allInteractions.length) * 100 : 0,
      averageInteractionsPerDay: this.calculateDailyInteractionAverage(allInteractions),
    }
  }

  calculateDailyInteractionAverage(interactions) {
    if (interactions.length === 0) return 0

    const dates = interactions.map((i) => new Date(i.timestamp).toDateString())
    const uniqueDates = [...new Set(dates)]

    return interactions.length / uniqueDates.length
  }
}

module.exports = new IdentityAnalyticsService()
