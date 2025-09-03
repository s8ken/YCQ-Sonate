"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { IdentityVerificationFlow } from "@/components/identity/IdentityVerificationFlow"
import { VerificationStatusTracker } from "@/components/identity/VerificationStatusTracker"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, ArrowLeft, CheckCircle } from "lucide-react"

export default function VerifyIdentityPage() {
  const searchParams = useSearchParams()
  const consentEnvelopeId = searchParams.get("envelope")
  const verificationMethod = searchParams.get("method")

  const [showVerificationFlow, setShowVerificationFlow] = useState(false)
  const [verifications, setVerifications] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (consentEnvelopeId) {
      fetchVerificationStatus()
    }
  }, [consentEnvelopeId])

  const fetchVerificationStatus = async () => {
    try {
      // In a real implementation, this would fetch verification status from API
      const mockVerifications = [
        {
          id: "ver-1",
          method: verificationMethod || "email",
          status: "pending",
          confidence: 0,
          startedAt: new Date().toISOString(),
          attempts: 0,
          maxAttempts: 3,
          details: {
            email: "user@example.com",
          },
        },
      ]
      setVerifications(mockVerifications)
    } catch (error) {
      console.error("Error fetching verification status:", error)
      setError("Failed to load verification status")
    }
  }

  const handleStartVerification = () => {
    if (!consentEnvelopeId || !verificationMethod) {
      setError("Missing consent envelope ID or verification method")
      return
    }
    setShowVerificationFlow(true)
  }

  const handleVerificationComplete = (result: any) => {
    console.log("Verification completed:", result)
    setShowVerificationFlow(false)

    // Update verification status
    setVerifications((prev) =>
      prev.map((v) =>
        v.method === verificationMethod
          ? {
              ...v,
              status: "completed",
              confidence: result.confidence || 0.9,
              completedAt: new Date().toISOString(),
            }
          : v,
      ),
    )
  }

  const handleVerificationCancel = () => {
    setShowVerificationFlow(false)
  }

  const handleRetryVerification = (verificationId: string) => {
    setVerifications((prev) =>
      prev.map((v) => (v.id === verificationId ? { ...v, status: "pending", attempts: v.attempts + 1 } : v)),
    )
    setShowVerificationFlow(true)
  }

  const handleViewDetails = (verificationId: string) => {
    console.log("View details for verification:", verificationId)
  }

  if (!consentEnvelopeId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-mono font-semibold text-gray-700 mb-2">Invalid Verification Request</h3>
            <p className="text-gray-500 font-mono text-sm mb-4">
              No consent envelope ID provided. Please start from the identity declaration process.
            </p>
            <Button onClick={() => window.history.back()} className="font-mono bg-black hover:bg-gray-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-black rounded-sm">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-mono font-bold text-black tracking-tight">Identity Verification</h1>
              <p className="text-gray-600 text-sm mt-1">
                Complete your identity verification to participate in the trust protocol
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {error && (
          <Alert className="mb-6">
            <AlertDescription className="font-mono">{error}</AlertDescription>
          </Alert>
        )}

        {showVerificationFlow ? (
          <IdentityVerificationFlow
            consentEnvelopeId={consentEnvelopeId}
            verificationMethod={verificationMethod || "email"}
            onVerificationComplete={handleVerificationComplete}
            onCancel={handleVerificationCancel}
          />
        ) : (
          <div className="space-y-8">
            <VerificationStatusTracker
              verifications={verifications}
              onRetryVerification={handleRetryVerification}
              onViewDetails={handleViewDetails}
            />

            {verifications.some((v) => v.status === "pending") && (
              <div className="text-center">
                <Button
                  onClick={handleStartVerification}
                  disabled={isLoading}
                  className="font-mono bg-black hover:bg-gray-800 px-8 py-3"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Starting Verification...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Start Verification Process
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
