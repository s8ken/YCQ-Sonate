"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Shield, Users, CheckCircle, AlertTriangle, Clock, Zap, Eye, X, ArrowRight, Bot, User } from "lucide-react"

interface TrustBridge {
  bridgeId: string
  userId: string
  agentId: string
  agentName: string
  humanTrustScore: number
  agentTrustScore: number
  mutualTrustScore: number
  status: "active" | "pending" | "revoked" | "expired"
  establishedAt: string
  expiresAt: string
  lastInteraction?: string
  interactions: Array<{
    type: string
    outcome: string
    timestamp: string
  }>
}

interface HumanAITrustBridgeProps {
  userId: string
  onEstablishTrust?: (agentId: string) => void
}

export function HumanAITrustBridge({ userId, onEstablishTrust }: HumanAITrustBridgeProps) {
  const [trustBridges, setTrustBridges] = useState<TrustBridge[]>([])
  const [selectedBridge, setSelectedBridge] = useState<TrustBridge | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchTrustBridges()
  }, [userId])

  const fetchTrustBridges = async () => {
    try {
      setIsLoading(true)
      // In a real implementation, this would fetch from the API
      const mockBridges: TrustBridge[] = [
        {
          bridgeId: "bridge-1",
          userId,
          agentId: "agent-1",
          agentName: "Claude Assistant",
          humanTrustScore: 0.92,
          agentTrustScore: 0.88,
          mutualTrustScore: 0.85,
          status: "active",
          establishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() + 358 * 24 * 60 * 60 * 1000).toISOString(),
          lastInteraction: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          interactions: [
            {
              type: "conversation",
              outcome: "successful",
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            },
          ],
        },
        {
          bridgeId: "bridge-2",
          userId,
          agentId: "agent-2",
          agentName: "GPT-4 Agent",
          humanTrustScore: 0.89,
          agentTrustScore: 0.91,
          mutualTrustScore: 0.78,
          status: "active",
          establishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() + 351 * 24 * 60 * 60 * 1000).toISOString(),
          lastInteraction: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          interactions: [],
        },
      ]
      setTrustBridges(mockBridges)
    } catch (error) {
      console.error("Error fetching trust bridges:", error)
      setError("Failed to load trust bridges")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRevokeTrust = async (bridgeId: string) => {
    try {
      // In a real implementation, this would call the API
      setTrustBridges((prev) => prev.filter((bridge) => bridge.bridgeId !== bridgeId))
    } catch (error) {
      console.error("Error revoking trust:", error)
      setError("Failed to revoke trust bridge")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "revoked":
        return "bg-red-100 text-red-800 border-red-200"
      case "expired":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4" />
      case "pending":
        return <Clock className="w-4 h-4" />
      case "revoked":
      case "expired":
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTrustScoreColor = (score: number) => {
    if (score >= 0.8) return "text-green-600"
    if (score >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <Card className="max-w-6xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-black rounded-sm">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-mono">Human-AI Trust Bridges</CardTitle>
              <CardDescription className="font-mono">
                Manage bidirectional trust relationships with AI agents
              </CardDescription>
            </div>
          </div>
          <Badge className="font-mono bg-blue-100 text-blue-800 border-blue-200">
            {trustBridges.filter((b) => b.status === "active").length} Active
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="font-mono">{error}</AlertDescription>
          </Alert>
        )}

        {/* Trust Bridge Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-mono font-bold text-green-700">
                {trustBridges.filter((b) => b.status === "active").length}
              </div>
              <div className="text-sm font-mono text-green-600">Active Bridges</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-mono font-bold text-blue-700">
                {trustBridges.length > 0
                  ? Math.round(
                      (trustBridges.reduce((sum, b) => sum + b.mutualTrustScore, 0) / trustBridges.length) * 100,
                    )
                  : 0}
                %
              </div>
              <div className="text-sm font-mono text-blue-600">Avg Trust Score</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-mono font-bold text-purple-700">
                {trustBridges.reduce((sum, b) => sum + b.interactions.length, 0)}
              </div>
              <div className="text-sm font-mono text-purple-600">Total Interactions</div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Trust Bridges List */}
        <div className="space-y-4">
          <h3 className="font-mono font-semibold text-lg">Trust Relationships</h3>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-2" />
              <p className="font-mono text-gray-600">Loading trust bridges...</p>
            </div>
          ) : trustBridges.length === 0 ? (
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-8 text-center">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="font-mono font-semibold text-gray-700 mb-2">No Trust Bridges</h4>
                <p className="font-mono text-gray-500 mb-4">You haven't established trust with any AI agents yet.</p>
                {onEstablishTrust && (
                  <Button
                    onClick={() => onEstablishTrust("new-agent")}
                    className="font-mono bg-black hover:bg-gray-800"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Establish First Trust Bridge
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {trustBridges.map((bridge) => (
                <Card
                  key={bridge.bridgeId}
                  className="border-2 border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <User className="w-5 h-5 text-gray-600" />
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                          <Bot className="w-5 h-5 text-gray-600" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-mono font-semibold">{bridge.agentName}</h4>
                            <Badge className={`font-mono text-xs ${getStatusColor(bridge.status)}`}>
                              {getStatusIcon(bridge.status)}
                              <span className="ml-1 capitalize">{bridge.status}</span>
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs font-mono text-gray-500 mt-1">
                            <span>Established: {formatDate(bridge.establishedAt)}</span>
                            {bridge.lastInteraction && <span>Last: {formatDate(bridge.lastInteraction)}</span>}
                            <span>Interactions: {bridge.interactions.length}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Trust Score Display */}
                        <div className="text-right">
                          <div className={`text-lg font-mono font-bold ${getTrustScoreColor(bridge.mutualTrustScore)}`}>
                            {Math.round(bridge.mutualTrustScore * 100)}%
                          </div>
                          <div className="text-xs font-mono text-gray-500">Mutual Trust</div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedBridge(bridge)}
                                className="font-mono text-xs bg-transparent"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="font-mono">Trust Bridge Details</DialogTitle>
                                <DialogDescription className="font-mono">
                                  Detailed information about your trust relationship with {bridge.agentName}
                                </DialogDescription>
                              </DialogHeader>

                              {selectedBridge && (
                                <div className="space-y-4">
                                  {/* Trust Scores Breakdown */}
                                  <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center">
                                      <div className="text-2xl font-mono font-bold text-blue-600">
                                        {Math.round(selectedBridge.humanTrustScore * 100)}%
                                      </div>
                                      <div className="text-xs font-mono text-gray-500">Human Trust</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-2xl font-mono font-bold text-green-600">
                                        {Math.round(selectedBridge.agentTrustScore * 100)}%
                                      </div>
                                      <div className="text-xs font-mono text-gray-500">Agent Trust</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-2xl font-mono font-bold text-purple-600">
                                        {Math.round(selectedBridge.mutualTrustScore * 100)}%
                                      </div>
                                      <div className="text-xs font-mono text-gray-500">Mutual Trust</div>
                                    </div>
                                  </div>

                                  {/* Trust Score Progress */}
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span className="font-mono text-gray-600">Trust Level</span>
                                      <span className="font-mono font-medium">
                                        {Math.round(selectedBridge.mutualTrustScore * 100)}%
                                      </span>
                                    </div>
                                    <Progress value={selectedBridge.mutualTrustScore * 100} className="h-2" />
                                  </div>

                                  {/* Bridge Information */}
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="font-mono text-gray-500">Bridge ID:</span>
                                      <p className="font-mono text-xs break-all">{selectedBridge.bridgeId}</p>
                                    </div>
                                    <div>
                                      <span className="font-mono text-gray-500">Status:</span>
                                      <p className="font-mono capitalize">{selectedBridge.status}</p>
                                    </div>
                                    <div>
                                      <span className="font-mono text-gray-500">Established:</span>
                                      <p className="font-mono">{formatDate(selectedBridge.establishedAt)}</p>
                                    </div>
                                    <div>
                                      <span className="font-mono text-gray-500">Expires:</span>
                                      <p className="font-mono">{formatDate(selectedBridge.expiresAt)}</p>
                                    </div>
                                  </div>

                                  {/* Recent Interactions */}
                                  {selectedBridge.interactions.length > 0 && (
                                    <div>
                                      <h4 className="font-mono font-semibold mb-2">Recent Interactions</h4>
                                      <div className="space-y-2 max-h-32 overflow-y-auto">
                                        {selectedBridge.interactions.slice(-5).map((interaction, index) => (
                                          <div
                                            key={index}
                                            className="flex justify-between text-xs font-mono p-2 bg-gray-50 rounded"
                                          >
                                            <span className="capitalize">{interaction.type}</span>
                                            <span className="capitalize">{interaction.outcome}</span>
                                            <span>{formatDate(interaction.timestamp)}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          {bridge.status === "active" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRevokeTrust(bridge.bridgeId)}
                              className="font-mono text-xs border-red-300 text-red-700 hover:bg-red-50 bg-transparent"
                            >
                              <X className="w-3 h-3 mr-1" />
                              Revoke
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
