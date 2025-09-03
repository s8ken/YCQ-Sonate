"use client"

import { useState, useEffect } from "react"
import { ConsentEnvelopeForm } from "@/components/identity/ConsentEnvelopeForm"
import { ConsentEnvelopeViewer } from "@/components/identity/ConsentEnvelopeViewer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Plus, User, FileText, CheckCircle, Clock } from "lucide-react"

export default function IdentityPage() {
  const [consentEnvelopes, setConsentEnvelopes] = useState([])
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchConsentEnvelopes()
  }, [])

  const fetchConsentEnvelopes = async () => {
    try {
      // In a real implementation, this would fetch from the API
      // For now, we'll use mock data
      const mockEnvelopes = [
        {
          consentId: "consent-123",
          identityAssertion:
            "I, John Doe, hereby assert my identity and consent to participate in the SYMBI Trust Protocol...",
          consentArticles: {
            dataProcessing: true,
            aiInteraction: true,
            trustProtocolParticipation: true,
            identityVerification: true,
            consensusParticipation: false,
            dataRetention: true,
          },
          verificationStatus: "verified",
          verificationMethod: "email",
          cryptographicProof: {
            signature: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
            keyId: "key-456",
            algorithm: "RS256",
            signedAt: new Date().toISOString(),
          },
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() + 358 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]
      setConsentEnvelopes(mockEnvelopes)
    } catch (error) {
      console.error("Error fetching consent envelopes:", error)
      setError("Failed to load consent envelopes")
    }
  }

  const handleCreateConsentEnvelope = async (formData: any) => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/human-identity/consent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create consent envelope")
      }

      const result = await response.json()
      setConsentEnvelopes((prev) => [...prev, result.data])
      setActiveTab("envelopes")
    } catch (error) {
      console.error("Error creating consent envelope:", error)
      setError(error instanceof Error ? error.message : "Failed to create consent envelope")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyIdentity = async (consentEnvelopeId: string) => {
    try {
      // In a real implementation, this would trigger the verification process
      console.log("Verifying identity for envelope:", consentEnvelopeId)
    } catch (error) {
      console.error("Error verifying identity:", error)
    }
  }

  const handleRevokeConsent = async (consentEnvelopeId: string) => {
    try {
      // In a real implementation, this would revoke the consent envelope
      console.log("Revoking consent for envelope:", consentEnvelopeId)
    } catch (error) {
      console.error("Error revoking consent:", error)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-black rounded-sm">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-mono font-bold text-black tracking-tight">Human Identity Management</h1>
              <p className="text-gray-600 text-sm mt-1">
                Manage your identity declarations and consent envelopes for trust protocol participation
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {error && (
          <Alert className="mb-6">
            <AlertDescription className="font-mono">{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 border border-gray-200">
            <TabsTrigger
              value="overview"
              className="font-mono text-sm data-[state=active]:bg-white data-[state=active]:text-black"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="create"
              className="font-mono text-sm data-[state=active]:bg-white data-[state=active]:text-black"
            >
              Create Declaration
            </TabsTrigger>
            <TabsTrigger
              value="envelopes"
              className="font-mono text-sm data-[state=active]:bg-white data-[state=active]:text-black"
            >
              My Envelopes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-mono font-medium text-gray-700">Total Envelopes</CardTitle>
                  <FileText className="h-5 w-5 text-gray-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-mono font-bold text-black">{consentEnvelopes.length}</div>
                  <p className="text-xs text-gray-500 mt-2 font-mono">Active consent envelopes</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-mono font-medium text-gray-700">Verified</CardTitle>
                  <CheckCircle className="h-5 w-5 text-gray-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-mono font-bold text-black">
                    {consentEnvelopes.filter((env: any) => env.verificationStatus === "verified").length}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 font-mono">Verified identities</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-mono font-medium text-gray-700">Pending</CardTitle>
                  <Clock className="h-5 w-5 text-gray-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-mono font-bold text-black">
                    {consentEnvelopes.filter((env: any) => env.verificationStatus === "pending").length}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 font-mono">Awaiting verification</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Identity Declaration Process
                </CardTitle>
                <CardDescription>
                  Follow these steps to establish your human identity within the trust protocol
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="bg-black text-white border-2 border-black">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-white text-black rounded-full flex items-center justify-center text-sm font-mono font-bold">
                          1
                        </div>
                        <CardTitle className="text-sm font-mono">Step 1</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h4 className="font-mono font-semibold text-sm mb-2">Create Consent Envelope</h4>
                      <p className="text-xs text-gray-300">Provide identity assertion and consent to trust articles</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-50 border-2 border-gray-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-700 text-white rounded-full flex items-center justify-center text-sm font-mono font-bold">
                          2
                        </div>
                        <CardTitle className="text-sm font-mono text-gray-700">Step 2</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h4 className="font-mono font-semibold text-sm mb-2 text-gray-800">Identity Verification</h4>
                      <p className="text-xs text-gray-600">Complete verification using your chosen method</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-50 border-2 border-gray-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-700 text-white rounded-full flex items-center justify-center text-sm font-mono font-bold">
                          3
                        </div>
                        <CardTitle className="text-sm font-mono text-gray-700">Step 3</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h4 className="font-mono font-semibold text-sm mb-2 text-gray-800">Cryptographic Proof</h4>
                      <p className="text-xs text-gray-600">System generates cryptographic proof of your consent</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-50 border-2 border-gray-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-700 text-white rounded-full flex items-center justify-center text-sm font-mono font-bold">
                          4
                        </div>
                        <CardTitle className="text-sm font-mono text-gray-700">Step 4</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h4 className="font-mono font-semibold text-sm mb-2 text-gray-800">Trust Protocol Access</h4>
                      <p className="text-xs text-gray-600">Participate in bidirectional trust with AI agents</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <ConsentEnvelopeForm onSubmit={handleCreateConsentEnvelope} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="envelopes" className="space-y-6">
            {consentEnvelopes.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-mono font-semibold text-gray-700 mb-2">No Consent Envelopes</h3>
                  <p className="text-gray-500 font-mono text-center mb-4">
                    You haven't created any consent envelopes yet. Create your first identity declaration to get
                    started.
                  </p>
                  <Button onClick={() => setActiveTab("create")} className="font-mono bg-black hover:bg-gray-800">
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Envelope
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {consentEnvelopes.map((envelope: any) => (
                  <ConsentEnvelopeViewer
                    key={envelope.consentId}
                    consentEnvelope={envelope}
                    onVerify={() => handleVerifyIdentity(envelope.consentId)}
                    onRevoke={() => handleRevokeConsent(envelope.consentId)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
