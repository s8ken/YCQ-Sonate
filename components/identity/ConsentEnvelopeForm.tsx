"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Lock, CheckCircle, AlertTriangle, FileText, Fingerprint } from "lucide-react"

interface ConsentArticles {
  dataProcessing: boolean
  aiInteraction: boolean
  trustProtocolParticipation: boolean
  identityVerification: boolean
  consensusParticipation: boolean
  dataRetention: boolean
}

interface ConsentEnvelopeFormProps {
  onSubmit: (data: any) => void
  isLoading?: boolean
}

export function ConsentEnvelopeForm({ onSubmit, isLoading = false }: ConsentEnvelopeFormProps) {
  const [identityAssertion, setIdentityAssertion] = useState("")
  const [verificationMethod, setVerificationMethod] = useState<string>("")
  const [biometricHash, setBiometricHash] = useState("")
  const [consentArticles, setConsentArticles] = useState<ConsentArticles>({
    dataProcessing: false,
    aiInteraction: false,
    trustProtocolParticipation: false,
    identityVerification: false,
    consensusParticipation: false,
    dataRetention: false,
  })

  const consentArticleDescriptions = {
    dataProcessing: {
      title: "Data Processing Consent",
      description: "I consent to the processing of my personal data for trust protocol operations",
      required: true,
    },
    aiInteraction: {
      title: "AI Interaction Consent",
      description: "I consent to interact with AI agents within the trust protocol framework",
      required: true,
    },
    trustProtocolParticipation: {
      title: "Trust Protocol Participation",
      description: "I consent to participate in the bidirectional trust verification system",
      required: true,
    },
    identityVerification: {
      title: "Identity Verification",
      description: "I consent to identity verification processes and cryptographic proof generation",
      required: true,
    },
    consensusParticipation: {
      title: "Consensus Participation",
      description: "I consent to participate in consensus mechanisms as a validator (optional)",
      required: false,
    },
    dataRetention: {
      title: "Data Retention Policy",
      description: "I understand and consent to the data retention policies outlined in the privacy policy",
      required: false,
    },
  }

  const handleConsentChange = (article: keyof ConsentArticles, checked: boolean) => {
    setConsentArticles((prev) => ({
      ...prev,
      [article]: checked,
    }))
  }

  const getCompletionPercentage = () => {
    const requiredArticles = Object.entries(consentArticleDescriptions).filter(([_, desc]) => desc.required)
    const completedRequired = requiredArticles.filter(([key, _]) => consentArticles[key as keyof ConsentArticles])
    return Math.round((completedRequired.length / requiredArticles.length) * 100)
  }

  const canSubmit = () => {
    const requiredArticles = Object.entries(consentArticleDescriptions)
      .filter(([_, desc]) => desc.required)
      .map(([key, _]) => key as keyof ConsentArticles)

    return (
      identityAssertion.trim() !== "" &&
      verificationMethod !== "" &&
      requiredArticles.every((article) => consentArticles[article])
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit()) return

    const formData = {
      identityAssertion,
      verificationMethod,
      biometricHash: biometricHash || undefined,
      consentArticles,
    }

    onSubmit(formData)
  }

  const completionPercentage = getCompletionPercentage()

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 bg-black rounded-sm">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-mono">Human Identity Declaration</CardTitle>
            <CardDescription className="text-base">
              Create your consent envelope with identity assertion for trust protocol participation
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Progress Indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-mono text-gray-600">Completion Progress</span>
            <span className="font-mono font-medium">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Identity Assertion */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-600" />
              <Label className="text-lg font-mono font-semibold">Identity Assertion</Label>
            </div>
            <Textarea
              placeholder="I, [Your Full Name], hereby assert my identity and consent to participate in the SYMBI Trust Protocol..."
              value={identityAssertion}
              onChange={(e) => setIdentityAssertion(e.target.value)}
              className="min-h-[120px] font-mono text-sm"
              required
            />
            <p className="text-xs text-gray-500 font-mono">
              Provide a clear statement of your identity and intent to participate in the trust protocol
            </p>
          </div>

          {/* Verification Method */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-gray-600" />
              <Label className="text-lg font-mono font-semibold">Verification Method</Label>
            </div>
            <Select value={verificationMethod} onValueChange={setVerificationMethod} required>
              <SelectTrigger>
                <SelectValue placeholder="Select your preferred verification method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email Verification</SelectItem>
                <SelectItem value="phone">Phone Verification</SelectItem>
                <SelectItem value="document">Document Verification</SelectItem>
                <SelectItem value="biometric">Biometric Verification</SelectItem>
                <SelectItem value="multi-factor">Multi-Factor Verification</SelectItem>
              </SelectContent>
            </Select>

            {verificationMethod === "biometric" && (
              <div className="space-y-2">
                <Label htmlFor="biometric-hash" className="text-sm font-mono">
                  Biometric Hash (Optional)
                </Label>
                <Input
                  id="biometric-hash"
                  type="password"
                  placeholder="Enter biometric hash for enhanced security"
                  value={biometricHash}
                  onChange={(e) => setBiometricHash(e.target.value)}
                  className="font-mono"
                />
              </div>
            )}
          </div>

          {/* Consent Articles */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-gray-600" />
              <Label className="text-lg font-mono font-semibold">Consent Articles</Label>
            </div>

            <div className="grid gap-4">
              {Object.entries(consentArticleDescriptions).map(([key, article]) => (
                <Card
                  key={key}
                  className={`border-2 transition-colors ${
                    consentArticles[key as keyof ConsentArticles]
                      ? "border-green-200 bg-green-50"
                      : article.required
                        ? "border-red-200 bg-red-50"
                        : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id={key}
                        checked={consentArticles[key as keyof ConsentArticles]}
                        onCheckedChange={(checked) => handleConsentChange(key as keyof ConsentArticles, !!checked)}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={key} className="font-mono font-semibold cursor-pointer">
                            {article.title}
                          </Label>
                          {article.required && (
                            <Badge variant="destructive" className="text-xs font-mono">
                              Required
                            </Badge>
                          )}
                          {consentArticles[key as keyof ConsentArticles] && (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 font-mono">{article.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Validation Alert */}
          {!canSubmit() && identityAssertion && verificationMethod && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="font-mono">
                Please accept all required consent articles to proceed with your identity declaration.
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-6">
            <Button
              type="submit"
              disabled={!canSubmit() || isLoading}
              className="px-8 py-3 font-mono text-base bg-black hover:bg-gray-800"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating Consent Envelope...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Create Consent Envelope
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
