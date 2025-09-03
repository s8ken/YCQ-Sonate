"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { Shield, CheckCircle, Clock, AlertTriangle, Eye, FileText, Lock, Calendar, Fingerprint } from "lucide-react"

interface ConsentEnvelope {
  consentId: string
  identityAssertion: string
  consentArticles: {
    dataProcessing: boolean
    aiInteraction: boolean
    trustProtocolParticipation: boolean
    identityVerification: boolean
    consensusParticipation: boolean
    dataRetention: boolean
  }
  verificationStatus: "pending" | "verified" | "rejected" | "expired"
  verificationMethod: string
  cryptographicProof?: {
    signature: string
    keyId: string
    algorithm: string
    signedAt: string
  }
  createdAt: string
  expiresAt: string
}

interface ConsentEnvelopeViewerProps {
  consentEnvelope: ConsentEnvelope
  onVerify?: () => void
  onRevoke?: () => void
}

export function ConsentEnvelopeViewer({ consentEnvelope, onVerify, onRevoke }: ConsentEnvelopeViewerProps) {
  const [showCryptographicProof, setShowCryptographicProof] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      case "expired":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-4 h-4" />
      case "pending":
        return <Clock className="w-4 h-4" />
      case "rejected":
      case "expired":
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const consentArticleLabels = {
    dataProcessing: "Data Processing",
    aiInteraction: "AI Interaction",
    trustProtocolParticipation: "Trust Protocol Participation",
    identityVerification: "Identity Verification",
    consensusParticipation: "Consensus Participation",
    dataRetention: "Data Retention",
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const isExpiringSoon = () => {
    const expiryDate = new Date(consentEnvelope.expiresAt)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-black rounded-sm">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-mono">Consent Envelope</CardTitle>
              <CardDescription className="font-mono">ID: {consentEnvelope.consentId}</CardDescription>
            </div>
          </div>
          <Badge className={`font-mono ${getStatusColor(consentEnvelope.verificationStatus)}`}>
            {getStatusIcon(consentEnvelope.verificationStatus)}
            <span className="ml-1 capitalize">{consentEnvelope.verificationStatus}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Expiry Warning */}
        {isExpiringSoon() && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="font-mono">
              Your consent envelope expires on {formatDate(consentEnvelope.expiresAt)}. Consider renewing it soon.
            </AlertDescription>
          </Alert>
        )}

        {/* Identity Assertion */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-mono font-semibold">Identity Assertion</h3>
          </div>
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-4">
              <p className="text-sm font-mono text-gray-700 whitespace-pre-wrap">{consentEnvelope.identityAssertion}</p>
            </CardContent>
          </Card>
        </div>

        {/* Verification Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-mono font-semibold">Verification Details</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-mono text-gray-600">Verification Method</Label>
              <p className="font-mono font-medium capitalize">{consentEnvelope.verificationMethod}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-mono text-gray-600">Status</Label>
              <div className="flex items-center gap-2">
                {getStatusIcon(consentEnvelope.verificationStatus)}
                <span className="font-mono font-medium capitalize">{consentEnvelope.verificationStatus}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Consent Articles */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-mono font-semibold">Consent Articles</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(consentEnvelope.consentArticles).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <span className="text-sm font-mono">
                  {consentArticleLabels[key as keyof typeof consentArticleLabels]}
                </span>
                {value ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Timestamps */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-mono font-semibold">Timeline</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-mono text-gray-600">Created</Label>
              <p className="font-mono text-sm">{formatDate(consentEnvelope.createdAt)}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-mono text-gray-600">Expires</Label>
              <p className="font-mono text-sm">{formatDate(consentEnvelope.expiresAt)}</p>
            </div>
          </div>
        </div>

        {/* Cryptographic Proof */}
        {consentEnvelope.cryptographicProof && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-mono font-semibold">Cryptographic Proof</h3>
            </div>
            <Dialog open={showCryptographicProof} onOpenChange={setShowCryptographicProof}>
              <DialogTrigger asChild>
                <Button variant="outline" className="font-mono bg-transparent">
                  <Eye className="w-4 h-4 mr-2" />
                  View Cryptographic Proof
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="font-mono">Cryptographic Proof Details</DialogTitle>
                  <DialogDescription className="font-mono">
                    Cryptographic signature and verification details for this consent envelope
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-mono text-gray-600">Algorithm</Label>
                    <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                      {consentEnvelope.cryptographicProof.algorithm}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-mono text-gray-600">Key ID</Label>
                    <p className="font-mono text-sm bg-gray-100 p-2 rounded break-all">
                      {consentEnvelope.cryptographicProof.keyId}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-mono text-gray-600">Signature</Label>
                    <p className="font-mono text-xs bg-gray-100 p-2 rounded break-all max-h-32 overflow-y-auto">
                      {consentEnvelope.cryptographicProof.signature}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-mono text-gray-600">Signed At</Label>
                    <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                      {formatDate(consentEnvelope.cryptographicProof.signedAt)}
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        <Separator />

        {/* Actions */}
        <div className="flex justify-end gap-3">
          {consentEnvelope.verificationStatus === "pending" && onVerify && (
            <Button onClick={onVerify} className="font-mono bg-black hover:bg-gray-800">
              <CheckCircle className="w-4 h-4 mr-2" />
              Verify Identity
            </Button>
          )}
          {onRevoke && (
            <Button
              variant="outline"
              onClick={onRevoke}
              className="font-mono border-red-300 text-red-700 hover:bg-red-50 bg-transparent"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Revoke Consent
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function Label({ children, className = "", ...props }: { children: React.ReactNode; className?: string }) {
  return (
    <label className={`text-sm font-medium ${className}`} {...props}>
      {children}
    </label>
  )
}
