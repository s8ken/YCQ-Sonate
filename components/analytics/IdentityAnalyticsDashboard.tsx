"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList,
} from "recharts"
import { BarChart3, Users, Shield, AlertTriangle, CheckCircle, Clock, Activity, RefreshCw } from "lucide-react"

interface AnalyticsData {
  overview: {
    totalConsentEnvelopes: number
    verifiedConsentEnvelopes: number
    consentVerificationRate: number
    totalIdentityDeclarations: number
    verifiedIdentityDeclarations: number
    identityVerificationRate: number
    averageTimeToVerification: number
    failureRate: number
  }
  verificationMethods: {
    methodBreakdown: Record<string, any>
    mostPopularMethod: string
    highestSuccessRateMethod: string
  }
  trustScores: {
    overallTrustScore: {
      average: number
      distribution: Array<{ label: string; count: number; percentage: number }>
    }
  }
  timeSeriesData: Array<{
    date: string
    consentEnvelopes: number
    verifiedEnvelopes: number
    averageTrustScore: number
  }>
  conversionFunnel: {
    stages: Array<{ name: string; count: number; conversionRate: number }>
    overallConversionRate: number
  }
  riskAnalysis: {
    overallRiskLevel: string
    riskFactors: Array<{
      type: string
      severity: string
      value: number
      description: string
    }>
  }
  trustBridgeMetrics: {
    totalBridges: number
    activeBridges: number
    averageTrustScore: number
    totalInteractions: number
  }
}

export function IdentityAnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [timeRange, setTimeRange] = useState("30d")
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true)
      // In a real implementation, this would fetch from the API
      const mockData: AnalyticsData = {
        overview: {
          totalConsentEnvelopes: 1247,
          verifiedConsentEnvelopes: 1089,
          consentVerificationRate: 87.3,
          totalIdentityDeclarations: 1089,
          verifiedIdentityDeclarations: 967,
          identityVerificationRate: 88.8,
          averageTimeToVerification: 2.4,
          failureRate: 8.7,
        },
        verificationMethods: {
          methodBreakdown: {
            email: { total: 456, verified: 398, successRate: 87.3 },
            phone: { total: 321, verified: 289, successRate: 90.0 },
            document: { total: 234, verified: 198, successRate: 84.6 },
            biometric: { total: 156, verified: 142, successRate: 91.0 },
            "multi-factor": { total: 80, verified: 76, successRate: 95.0 },
          },
          mostPopularMethod: "email",
          highestSuccessRateMethod: "multi-factor",
        },
        trustScores: {
          overallTrustScore: {
            average: 0.78,
            distribution: [
              { label: "Very Low", count: 45, percentage: 4.7 },
              { label: "Low", count: 89, percentage: 9.2 },
              { label: "Medium", count: 234, percentage: 24.2 },
              { label: "High", count: 398, percentage: 41.1 },
              { label: "Very High", count: 201, percentage: 20.8 },
            ],
          },
        },
        timeSeriesData: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          consentEnvelopes: Math.floor(Math.random() * 50) + 20,
          verifiedEnvelopes: Math.floor(Math.random() * 40) + 15,
          averageTrustScore: 0.7 + Math.random() * 0.25,
        })),
        conversionFunnel: {
          stages: [
            { name: "Visitors", count: 1500, conversionRate: 100 },
            { name: "Consent Created", count: 1247, conversionRate: 83.1 },
            { name: "Consent Verified", count: 1089, conversionRate: 87.3 },
            { name: "Declaration Created", count: 1089, conversionRate: 100 },
            { name: "Declaration Verified", count: 967, conversionRate: 88.8 },
          ],
          overallConversionRate: 64.5,
        },
        riskAnalysis: {
          overallRiskLevel: "low",
          riskFactors: [
            {
              type: "low_trust_scores",
              severity: "medium",
              value: 13.9,
              description: "13.9% of users have low trust scores",
            },
          ],
        },
        trustBridgeMetrics: {
          totalBridges: 234,
          activeBridges: 198,
          averageTrustScore: 0.82,
          totalInteractions: 1456,
        },
      }

      setAnalyticsData(mockData)
    } catch (error) {
      console.error("Error fetching analytics:", error)
      setError("Failed to load analytics data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAnalyticsData()
    setRefreshing(false)
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const COLORS = ["#000000", "#374151", "#6B7280", "#9CA3AF", "#D1D5DB"]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4" />
          <p className="font-mono text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-mono font-semibold text-gray-700 mb-2">No Analytics Data</h3>
            <p className="text-gray-500 font-mono text-sm mb-4">Unable to load analytics data at this time.</p>
            <Button onClick={fetchAnalyticsData} className="font-mono bg-black hover:bg-gray-800">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-black rounded-sm">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-mono font-bold text-black tracking-tight">Identity Analytics</h1>
                <p className="text-gray-600 text-sm mt-1">
                  Comprehensive insights into identity verification and trust protocol performance
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32 font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                className="font-mono bg-transparent"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="font-mono">{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 bg-gray-100 border border-gray-200">
            <TabsTrigger
              value="overview"
              className="font-mono text-sm data-[state=active]:bg-white data-[state=active]:text-black"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="verification"
              className="font-mono text-sm data-[state=active]:bg-white data-[state=active]:text-black"
            >
              Verification
            </TabsTrigger>
            <TabsTrigger
              value="trust-scores"
              className="font-mono text-sm data-[state=active]:bg-white data-[state=active]:text-black"
            >
              Trust Scores
            </TabsTrigger>
            <TabsTrigger
              value="trends"
              className="font-mono text-sm data-[state=active]:bg-white data-[state=active]:text-black"
            >
              Trends
            </TabsTrigger>
            <TabsTrigger
              value="risk"
              className="font-mono text-sm data-[state=active]:bg-white data-[state=active]:text-black"
            >
              Risk Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-mono font-medium text-gray-700">Total Verifications</CardTitle>
                  <Users className="h-5 w-5 text-gray-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-mono font-bold text-black">
                    {analyticsData.overview.totalIdentityDeclarations.toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 font-mono">
                    {analyticsData.overview.verifiedIdentityDeclarations.toLocaleString()} verified
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-mono font-medium text-gray-700">Success Rate</CardTitle>
                  <CheckCircle className="h-5 w-5 text-gray-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-mono font-bold text-black">
                    {analyticsData.overview.identityVerificationRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-gray-500 mt-2 font-mono">Identity verification rate</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-mono font-medium text-gray-700">Avg Time</CardTitle>
                  <Clock className="h-5 w-5 text-gray-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-mono font-bold text-black">
                    {analyticsData.overview.averageTimeToVerification.toFixed(1)}h
                  </div>
                  <p className="text-xs text-gray-500 mt-2 font-mono">To verification</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-mono font-medium text-gray-700">Trust Bridges</CardTitle>
                  <Shield className="h-5 w-5 text-gray-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-mono font-bold text-black">
                    {analyticsData.trustBridgeMetrics.activeBridges}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 font-mono">
                    {analyticsData.trustBridgeMetrics.totalBridges} total bridges
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Conversion Funnel */}
            <Card>
              <CardHeader>
                <CardTitle className="font-mono">Conversion Funnel</CardTitle>
                <CardDescription className="font-mono">
                  User journey from initial visit to verified identity declaration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <FunnelChart>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "6px",
                          fontFamily: "monospace",
                        }}
                      />
                      <Funnel
                        dataKey="count"
                        data={analyticsData.conversionFunnel.stages}
                        isAnimationActive
                        fill="#000000"
                      >
                        <LabelList position="center" fill="#fff" stroke="none" fontSize={12} fontFamily="monospace" />
                      </Funnel>
                    </FunnelChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 text-center">
                  <Badge className="font-mono bg-black text-white">
                    Overall Conversion: {analyticsData.conversionFunnel.overallConversionRate.toFixed(1)}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verification" className="space-y-6">
            {/* Verification Methods */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-mono">Verification Methods Usage</CardTitle>
                  <CardDescription className="font-mono">Distribution of verification methods</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={Object.entries(analyticsData.verificationMethods.methodBreakdown).map(
                            ([method, stats]: [string, any]) => ({
                              name: method,
                              value: stats.total,
                            }),
                          )}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {Object.entries(analyticsData.verificationMethods.methodBreakdown).map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "6px",
                            fontFamily: "monospace",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-mono">Success Rates by Method</CardTitle>
                  <CardDescription className="font-mono">Verification success rates for each method</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={Object.entries(analyticsData.verificationMethods.methodBreakdown).map(
                          ([method, stats]: [string, any]) => ({
                            method,
                            successRate: stats.successRate,
                          }),
                        )}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="method" tick={{ fontFamily: "monospace", fontSize: 12 }} />
                        <YAxis tick={{ fontFamily: "monospace", fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "6px",
                            fontFamily: "monospace",
                          }}
                        />
                        <Bar dataKey="successRate" fill="#000000" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trust-scores" className="space-y-6">
            {/* Trust Score Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="font-mono">Trust Score Distribution</CardTitle>
                <CardDescription className="font-mono">
                  Distribution of user trust scores across different ranges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData.trustScores.overallTrustScore.distribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" tick={{ fontFamily: "monospace", fontSize: 12 }} />
                        <YAxis tick={{ fontFamily: "monospace", fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "6px",
                            fontFamily: "monospace",
                          }}
                        />
                        <Bar dataKey="count" fill="#000000" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-mono font-bold text-black">
                        {Math.round(analyticsData.trustScores.overallTrustScore.average * 100)}%
                      </div>
                      <div className="text-sm font-mono text-gray-500">Average Trust Score</div>
                    </div>

                    <div className="space-y-3">
                      {analyticsData.trustScores.overallTrustScore.distribution.map((range) => (
                        <div key={range.label} className="space-y-1">
                          <div className="flex justify-between text-sm font-mono">
                            <span>{range.label}</span>
                            <span>{range.percentage.toFixed(1)}%</span>
                          </div>
                          <Progress value={range.percentage} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            {/* Time Series Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="font-mono">Verification Trends</CardTitle>
                <CardDescription className="font-mono">Daily verification activity over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData.timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontFamily: "monospace", fontSize: 10 }}
                        tickFormatter={(value) =>
                          new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                        }
                      />
                      <YAxis tick={{ fontFamily: "monospace", fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "6px",
                          fontFamily: "monospace",
                        }}
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="consentEnvelopes"
                        stroke="#000000"
                        strokeWidth={2}
                        name="Consent Envelopes"
                      />
                      <Line
                        type="monotone"
                        dataKey="verifiedEnvelopes"
                        stroke="#6B7280"
                        strokeWidth={2}
                        name="Verified Envelopes"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risk" className="space-y-6">
            {/* Risk Analysis */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-mono">Risk Analysis</CardTitle>
                    <CardDescription className="font-mono">
                      Current risk factors and system health assessment
                    </CardDescription>
                  </div>
                  <Badge className={`font-mono ${getRiskLevelColor(analyticsData.riskAnalysis.overallRiskLevel)}`}>
                    <Activity className="w-3 h-3 mr-1" />
                    {analyticsData.riskAnalysis.overallRiskLevel.toUpperCase()} RISK
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.riskAnalysis.riskFactors.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                      <h3 className="font-mono font-semibold text-green-700 mb-2">No Risk Factors Detected</h3>
                      <p className="font-mono text-green-600 text-sm">System is operating within normal parameters</p>
                    </div>
                  ) : (
                    analyticsData.riskAnalysis.riskFactors.map((factor, index) => (
                      <Alert key={index}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="font-mono">
                          <div className="flex justify-between items-start">
                            <div>
                              <strong>{factor.description}</strong>
                              <div className="text-xs text-gray-500 mt-1">Type: {factor.type}</div>
                            </div>
                            <Badge className={`font-mono ${getRiskLevelColor(factor.severity)}`}>
                              {factor.severity.toUpperCase()}
                            </Badge>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
