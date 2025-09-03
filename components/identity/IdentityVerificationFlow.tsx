"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Shield,
  Mail,
  Phone,
  FileText,
  Fingerprint,
  CheckCircle,
  AlertTriangle,
  Camera,
  Upload,
  Send,
} from "lucide-react"

interface VerificationFlowProps {
  consentEnvelopeId: string
  verificationMethod: string
  onVerificationComplete: (result: any) => void
  onCancel: () => void
}

export function IdentityVerificationFlow({
  consentEnvelopeId,
  verificationMethod,
  onVerificationComplete,
  onCancel,
}: VerificationFlowProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [verificationData, setVerificationData] = useState<any>({})

  const getVerificationSteps = () => {
    switch (verificationMethod) {
      case "email":
        return ["Send Code", "Verify Code", "Complete"]
      case "phone":
        return ["Send SMS", "Verify Code", "Complete"]
      case "document":
        return ["Upload Document", "Review", "Complete"]
      case "biometric":
        return ["Capture Biometric", "Process", "Complete"]
      case "multi-factor":
        return ["Select Factors", "Verify Each", "Complete"]
      default:
        return ["Verify", "Complete"]
    }
  }

  const steps = getVerificationSteps()
  const progress = (currentStep / steps.length) * 100

  const handleVerificationSubmit = async (data: any) => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/human-identity/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          consentEnvelopeId,
          verificationData: data,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Verification failed")
      }

      const result = await response.json()

      if (result.success) {
        setCurrentStep(steps.length)
        onVerificationComplete(result.data)
      } else {
        throw new Error(result.error || "Verification failed")
      }
    } catch (error) {
      console.error("Verification error:", error)
      setError(error instanceof Error ? error.message : "Verification failed")
    } finally {
      setIsLoading(false)
    }
  }

  const renderVerificationMethod = () => {
    switch (verificationMethod) {
      case "email":
        return <EmailVerification onSubmit={handleVerificationSubmit} isLoading={isLoading} />
      case "phone":
        return <PhoneVerification onSubmit={handleVerificationSubmit} isLoading={isLoading} />
      case "document":
        return <DocumentVerification onSubmit={handleVerificationSubmit} isLoading={isLoading} />
      case "biometric":
        return <BiometricVerification onSubmit={handleVerificationSubmit} isLoading={isLoading} />
      case "multi-factor":
        return <MultiFactorVerification onSubmit={handleVerificationSubmit} isLoading={isLoading} />
      default:
        return <div>Unsupported verification method</div>
    }
  }

  const getMethodIcon = () => {
    switch (verificationMethod) {
      case "email":
        return <Mail className="w-6 h-6" />
      case "phone":
        return <Phone className="w-6 h-6" />
      case "document":
        return <FileText className="w-6 h-6" />
      case "biometric":
        return <Fingerprint className="w-6 h-6" />
      case "multi-factor":
        return <Shield className="w-6 h-6" />
      default:
        return <Shield className="w-6 h-6" />
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 bg-black rounded-sm text-white">
            {getMethodIcon()}
          </div>
          <div>
            <CardTitle className="text-xl font-mono">Identity Verification</CardTitle>
            <CardDescription className="font-mono capitalize">
              {verificationMethod.replace("-", " ")} Verification
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Indicator */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="font-mono text-gray-600">Progress</span>
            <span className="font-mono font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs font-mono text-gray-500">
            {steps.map((step, index) => (
              <span
                key={index}
                className={`${index + 1 <= currentStep ? "text-black font-semibold" : "text-gray-400"}`}
              >
                {step}
              </span>
            ))}
          </div>
        </div>

        <Separator />

        {/* Error Display */}
        {error && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="font-mono">{error}</AlertDescription>
          </Alert>
        )}

        {/* Verification Method Component */}
        {currentStep < steps.length ? (
          renderVerificationMethod()
        ) : (
          <VerificationComplete verificationMethod={verificationMethod} />
        )}

        {/* Actions */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onCancel} disabled={isLoading} className="font-mono bg-transparent">
            Cancel
          </Button>
          {currentStep === steps.length && (
            <Button
              onClick={() => onVerificationComplete(verificationData)}
              className="font-mono bg-black hover:bg-gray-800"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete Verification
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function EmailVerification({ onSubmit, isLoading }: { onSubmit: (data: any) => void; isLoading: boolean }) {
  const [email, setEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [codeSent, setCodeSent] = useState(false)

  const handleSendCode = async () => {
    if (!email) return

    // Simulate sending verification code
    setCodeSent(true)
  }

  const handleVerifyCode = () => {
    onSubmit({
      email,
      verificationCode,
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="font-mono">
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={codeSent}
          className="font-mono"
        />
      </div>

      {!codeSent ? (
        <Button
          onClick={handleSendCode}
          disabled={!email || isLoading}
          className="w-full font-mono bg-black hover:bg-gray-800"
        >
          <Send className="w-4 h-4 mr-2" />
          Send Verification Code
        </Button>
      ) : (
        <div className="space-y-4">
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription className="font-mono">
              Verification code sent to {email}. Please check your inbox.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="code" className="font-mono">
              Verification Code
            </Label>
            <Input
              id="code"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength={6}
              className="font-mono text-center text-lg tracking-widest"
            />
          </div>

          <Button
            onClick={handleVerifyCode}
            disabled={verificationCode.length !== 6 || isLoading}
            className="w-full font-mono bg-black hover:bg-gray-800"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Verify Code
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

function PhoneVerification({ onSubmit, isLoading }: { onSubmit: (data: any) => void; isLoading: boolean }) {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [codeSent, setCodeSent] = useState(false)

  const handleSendCode = async () => {
    if (!phoneNumber) return
    setCodeSent(true)
  }

  const handleVerifyCode = () => {
    onSubmit({
      phoneNumber,
      verificationCode,
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phone" className="font-mono">
          Phone Number
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+1 (555) 123-4567"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          disabled={codeSent}
          className="font-mono"
        />
      </div>

      {!codeSent ? (
        <Button
          onClick={handleSendCode}
          disabled={!phoneNumber || isLoading}
          className="w-full font-mono bg-black hover:bg-gray-800"
        >
          <Phone className="w-4 h-4 mr-2" />
          Send SMS Code
        </Button>
      ) : (
        <div className="space-y-4">
          <Alert>
            <Phone className="h-4 w-4" />
            <AlertDescription className="font-mono">
              SMS code sent to {phoneNumber}. Please check your messages.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="sms-code" className="font-mono">
              SMS Code
            </Label>
            <Input
              id="sms-code"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength={6}
              className="font-mono text-center text-lg tracking-widest"
            />
          </div>

          <Button
            onClick={handleVerifyCode}
            disabled={verificationCode.length !== 6 || isLoading}
            className="w-full font-mono bg-black hover:bg-gray-800"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Verify SMS Code
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

function DocumentVerification({ onSubmit, isLoading }: { onSubmit: (data: any) => void; isLoading: boolean }) {
  const [documentType, setDocumentType] = useState("")
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [documentHash, setDocumentHash] = useState("")

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setDocumentFile(file)
      // In a real implementation, you would generate a hash of the document
      setDocumentHash(`doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
    }
  }

  const handleVerifyDocument = () => {
    onSubmit({
      documentType,
      documentHash,
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="doc-type" className="font-mono">
          Document Type
        </Label>
        <Select value={documentType} onValueChange={setDocumentType}>
          <SelectTrigger>
            <SelectValue placeholder="Select document type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="passport">Passport</SelectItem>
            <SelectItem value="drivers-license">Driver's License</SelectItem>
            <SelectItem value="national-id">National ID</SelectItem>
            <SelectItem value="birth-certificate">Birth Certificate</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="document" className="font-mono">
          Upload Document
        </Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input id="document" type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
          <label htmlFor="document" className="cursor-pointer">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="font-mono text-sm text-gray-600">
              {documentFile ? documentFile.name : "Click to upload document"}
            </p>
            <p className="font-mono text-xs text-gray-400 mt-1">Supported: JPG, PNG, PDF (Max 10MB)</p>
          </label>
        </div>
      </div>

      {documentFile && (
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription className="font-mono">
            Document uploaded successfully. Hash: {documentHash}
          </AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handleVerifyDocument}
        disabled={!documentType || !documentFile || isLoading}
        className="w-full font-mono bg-black hover:bg-gray-800"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            Processing Document...
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Verify Document
          </>
        )}
      </Button>
    </div>
  )
}

function BiometricVerification({ onSubmit, isLoading }: { onSubmit: (data: any) => void; isLoading: boolean }) {
  const [biometricHash, setBiometricHash] = useState("")
  const [captured, setCaptured] = useState(false)

  const handleCaptureBiometric = () => {
    // Simulate biometric capture
    const hash = `bio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    setBiometricHash(hash)
    setCaptured(true)
  }

  const handleVerifyBiometric = () => {
    onSubmit({
      biometricHash,
    })
  }

  return (
    <div className="space-y-4">
      <div className="text-center space-y-4">
        <div className="w-32 h-32 mx-auto border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
          {captured ? (
            <CheckCircle className="w-12 h-12 text-green-600" />
          ) : (
            <Fingerprint className="w-12 h-12 text-gray-400" />
          )}
        </div>

        <div>
          <h3 className="font-mono font-semibold">Biometric Capture</h3>
          <p className="font-mono text-sm text-gray-600">
            {captured ? "Biometric data captured successfully" : "Place your finger on the sensor"}
          </p>
        </div>
      </div>

      {!captured ? (
        <Button onClick={handleCaptureBiometric} className="w-full font-mono bg-black hover:bg-gray-800">
          <Camera className="w-4 h-4 mr-2" />
          Capture Biometric
        </Button>
      ) : (
        <div className="space-y-4">
          <Alert>
            <Fingerprint className="h-4 w-4" />
            <AlertDescription className="font-mono">Biometric captured. Hash: {biometricHash}</AlertDescription>
          </Alert>

          <Button
            onClick={handleVerifyBiometric}
            disabled={isLoading}
            className="w-full font-mono bg-black hover:bg-gray-800"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Verifying Biometric...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Verify Biometric
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

function MultiFactorVerification({ onSubmit, isLoading }: { onSubmit: (data: any) => void; isLoading: boolean }) {
  const [selectedFactors, setSelectedFactors] = useState<string[]>([])
  const [factorData, setFactorData] = useState<any>({})

  const availableFactors = [
    { id: "email", name: "Email Verification", icon: Mail },
    { id: "phone", name: "SMS Verification", icon: Phone },
    { id: "biometric", name: "Biometric Scan", icon: Fingerprint },
  ]

  const handleFactorToggle = (factorId: string) => {
    setSelectedFactors((prev) => (prev.includes(factorId) ? prev.filter((id) => id !== factorId) : [...prev, factorId]))
  }

  const handleVerifyMultiFactor = () => {
    const factors = selectedFactors.map((factorId) => ({
      method: factorId,
      data: factorData[factorId] || {},
    }))

    onSubmit({
      factors,
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-mono font-semibold mb-2">Select Verification Factors</h3>
        <p className="font-mono text-sm text-gray-600 mb-4">
          Choose at least 2 verification methods for enhanced security
        </p>
      </div>

      <div className="space-y-3">
        {availableFactors.map((factor) => {
          const Icon = factor.icon
          const isSelected = selectedFactors.includes(factor.id)

          return (
            <Card
              key={factor.id}
              className={`cursor-pointer transition-colors ${
                isSelected ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => handleFactorToggle(factor.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                      isSelected ? "border-black bg-black" : "border-gray-300"
                    }`}
                  >
                    {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                  </div>
                  <Icon className="w-5 h-5 text-gray-600" />
                  <span className="font-mono font-medium">{factor.name}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Button
        onClick={handleVerifyMultiFactor}
        disabled={selectedFactors.length < 2 || isLoading}
        className="w-full font-mono bg-black hover:bg-gray-800"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            Verifying Factors...
          </>
        ) : (
          <>
            <Shield className="w-4 h-4 mr-2" />
            Verify Selected Factors ({selectedFactors.length})
          </>
        )}
      </Button>
    </div>
  )
}

function VerificationComplete({ verificationMethod }: { verificationMethod: string }) {
  return (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>

      <div>
        <h3 className="font-mono font-semibold text-lg">Verification Complete!</h3>
        <p className="font-mono text-sm text-gray-600 mt-2">
          Your identity has been successfully verified using {verificationMethod.replace("-", " ")} verification.
        </p>
      </div>

      <Badge className="bg-green-100 text-green-800 border-green-200 font-mono">
        <CheckCircle className="w-3 h-3 mr-1" />
        Verified
      </Badge>
    </div>
  )
}
