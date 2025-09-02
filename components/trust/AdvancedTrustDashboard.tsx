"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Lock, Brain, AlertTriangle, CheckCircle, Key, Brain as Chain } from "lucide-react"

interface TrustMetrics {
  zkProofsGenerated: number
  multiSigTransactions: number
  immutableRecords: number
  anomaliesDetected: number
  chainIntegrity: boolean
}

export function AdvancedTrustDashboard() {
  const [metrics, setMetrics] = useState<TrustMetrics>({
    zkProofsGenerated: 0,
    multiSigTransactions: 0,
    immutableRecords: 0,
    anomaliesDetected: 0,
    chainIntegrity: true,
  })
  const [loading, setLoading] = useState(false)

  const handleGenerateZKProof = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/trust-protocol/advanced", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_zk_proof",
          data: {
            secret: "user-private-data",
            publicInputs: [1, 2, 3],
          },
        }),
      })
      const result = await response.json()
      if (result.success) {
        setMetrics((prev) => ({ ...prev, zkProofsGenerated: prev.zkProofsGenerated + 1 }))
      }
    } catch (error) {
      console.error("ZK proof generation failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateImmutableRecord = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/trust-protocol/advanced", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_immutable_record",
          data: {
            trustData: {
              agentId: "test-agent",
              trustScore: 0.95,
              timestamp: Date.now(),
            },
          },
        }),
      })
      const result = await response.json()
      if (result.success) {
        setMetrics((prev) => ({ ...prev, immutableRecords: prev.immutableRecords + 1 }))
      }
    } catch (error) {
      console.error("Immutable record creation failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyChainIntegrity = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/trust-protocol/advanced", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify_chain_integrity",
          data: {},
        }),
      })
      const result = await response.json()
      if (result.success) {
        setMetrics((prev) => ({ ...prev, chainIntegrity: result.data.valid }))
      }
    } catch (error) {
      console.error("Chain verification failed:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ZK Proofs</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.zkProofsGenerated}</div>
            <p className="text-xs text-muted-foreground">Privacy-preserving verifications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Multi-Sig Transactions</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.multiSigTransactions}</div>
            <p className="text-xs text-muted-foreground">Secure multi-party operations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Immutable Records</CardTitle>
            <Chain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.immutableRecords}</div>
            <p className="text-xs text-muted-foreground">Blockchain-secured entries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chain Integrity</CardTitle>
            {metrics.chainIntegrity ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.chainIntegrity ? "Valid" : "Invalid"}</div>
            <p className="text-xs text-muted-foreground">Blockchain verification status</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="zk-proofs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="zk-proofs">Zero-Knowledge Proofs</TabsTrigger>
          <TabsTrigger value="multisig">Multi-Signature</TabsTrigger>
          <TabsTrigger value="blockchain">Immutable Records</TabsTrigger>
          <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="zk-proofs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Privacy-Preserving Verification</CardTitle>
              <CardDescription>
                Generate and verify zero-knowledge proofs for trust without revealing sensitive data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={handleGenerateZKProof} disabled={loading}>
                  <Shield className="w-4 h-4 mr-2" />
                  Generate ZK Proof
                </Button>
                <Button variant="outline" disabled={loading}>
                  <Lock className="w-4 h-4 mr-2" />
                  Verify Proof
                </Button>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">ZK Proof Benefits</h4>
                <ul className="text-sm space-y-1">
                  <li>• Verify trust without exposing private data</li>
                  <li>• Maintain user privacy while ensuring compliance</li>
                  <li>• Enable selective disclosure of trust attributes</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="multisig" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Multi-Signature Security</CardTitle>
              <CardDescription>Require multiple signatures for critical trust protocol operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button disabled={loading}>
                  <Key className="w-4 h-4 mr-2" />
                  Create Multi-Sig Transaction
                </Button>
                <Button variant="outline" disabled={loading}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Sign Transaction
                </Button>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">Multi-Sig Configuration</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Required Signatures: 3 of 5</div>
                  <div>Active Signers: 5</div>
                  <div>Pending Transactions: 0</div>
                  <div>Completed: 12</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blockchain" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Immutable Trust Records</CardTitle>
              <CardDescription>Create tamper-proof records on blockchain-like infrastructure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={handleCreateImmutableRecord} disabled={loading}>
                  <Chain className="w-4 h-4 mr-2" />
                  Create Record
                </Button>
                <Button variant="outline" onClick={handleVerifyChainIntegrity} disabled={loading}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verify Integrity
                </Button>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">Chain Status</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Blocks:</span>
                    <span>{metrics.immutableRecords}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Chain Integrity:</span>
                    <Badge variant={metrics.chainIntegrity ? "default" : "destructive"}>
                      {metrics.chainIntegrity ? "Valid" : "Invalid"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Trust Analytics</CardTitle>
              <CardDescription>AI-powered behavioral analysis and anomaly detection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button disabled={loading}>
                  <Brain className="w-4 h-4 mr-2" />
                  Analyze Behavior
                </Button>
                <Button variant="outline" disabled={loading}>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Detect Anomalies
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Trust Score Distribution</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>High Trust (0.8-1.0):</span>
                      <span>65%</span>
                    </div>
                    <Progress value={65} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span>Medium Trust (0.5-0.8):</span>
                      <span>30%</span>
                    </div>
                    <Progress value={30} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span>Low Trust (0.0-0.5):</span>
                      <span>5%</span>
                    </div>
                    <Progress value={5} className="h-2" />
                  </div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Anomaly Detection</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Anomalies Detected:</span>
                      <span>{metrics.anomaliesDetected}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>False Positive Rate:</span>
                      <span>2.1%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Detection Accuracy:</span>
                      <span>97.9%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
