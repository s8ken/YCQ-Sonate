"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Shield,
  Mail,
  Phone,
  FileText,
  Fingerprint,
  RefreshCw,
  Eye,
} from "lucide-react"

interface VerificationStatus {
  id: string
  method: string
  status: "pending" | "in-progress" | "completed" | "failed" | "expired"
  confidence: number
  startedAt: string
  completedAt?: string
  attempts: number
  maxAttempts: number
  details?: {
    email?: string
    phoneNumber?: string
    documentType?: string
    factors?: string[]
  }
}

interface VerificationStatusTrackerProps {
  verifications: VerificationStatus[]
  onRetryVerification?: (verificationId: string) => void
  onViewDetails?: (verificationId: string) => void
}

export function VerificationStatusTracker({
  verifications,
  onRetryVerification,
  onViewDetails,
}: VerificationStatusTrackerProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "failed":
        return "bg-red-100 text-red-800 border-red-200"
      case "expired":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "in-progress":
        return <RefreshCw className="w-4 h-4 animate-spin" />
      case "pending":
        return <Clock className="w-4 h-4" />
      case "failed":
      case "expired":
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "email":
        return <Mail className="w-5 h-5" />
      case "phone":
        return <Phone className="w-5 h-5" />
      case "document":
        return <FileText className="w-5 h-5" />
      case "biometric":
        return <Fingerprint className="w-5 h-5" />
      case "multi-factor":
        return <Shield className="w-5 h-5" />
      default:
        return <Shield className="w-5 h-5" />
    }
  }

  const getOverallProgress = () => {
    const completed = verifications.filter((v) => v.status === "completed").length
    return verifications.length > 0 ? (completed / verifications.length) * 100 : 0
  }

  const getOverallStatus = () => {
    if (verifications.length === 0) return "No verifications"

    const hasCompleted = verifications.some((v) => v.status === "completed")
    const hasInProgress = verifications.some((v) => v.status === "in-progress")
    const hasFailed = verifications.some((v) => v.status === "failed")

    if (verifications.every((v) => v.status === "completed")) return "All verified"
    if (hasInProgress) return "Verification in progress"
    if (hasFailed) return "Some verifications failed"
    if (hasCompleted) return "Partially verified"
    return "Pending verification"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const overallProgress = getOverallProgress()
  const overallStatus = getOverallStatus()

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-black rounded-sm">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-mono">Verification Status</CardTitle>
              <CardDescription className="font-mono">{overallStatus}</CardDescription>
            </div>
          </div>
          <Badge className={`font-mono ${getStatusColor(overallProgress === 100 ? "completed" : "in-progress")}`}>
            {Math.round(overallProgress)}% Complete
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-mono text-gray-600">Overall Progress</span>
            <span className="font-mono font-medium">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        <Separator />

        {/* Individual Verifications */}
        <div className="space-y-4">
          <h3 className="font-mono font-semibold">Verification Methods</h3>

          {verifications.length === 0 ? (
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-6 text-center">
                <Shield className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="font-mono text-gray-600">No verifications started yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {verifications.map((verification) => (
                <Card key={verification.id} className="border-2 border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-gray-600">{getMethodIcon(verification.method)}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-mono font-semibold capitalize">
                              {verification.method.replace("-", " ")} Verification
                            </h4>
                            <Badge className={`font-mono text-xs ${getStatusColor(verification.status)}`}>
                              {getStatusIcon(verification.status)}
                              <span className="ml-1 capitalize">{verification.status}</span>
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs font-mono text-gray-500 mt-1">
                            <span>Started: {formatDate(verification.startedAt)}</span>
                            {verification.completedAt && <span>Completed: {formatDate(verification.completedAt)}</span>}
                            <span>
                              Attempts: {verification.attempts}/{verification.maxAttempts}
                            </span>
                            {verification.status === "completed" && (
                              <span>Confidence: {Math.round(verification.confidence * 100)}%</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {onViewDetails && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewDetails(verification.id)}
                            className="font-mono text-xs bg-transparent"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Details
                          </Button>
                        )}

                        {verification.status === "failed" &&
                          verification.attempts < verification.maxAttempts &&
                          onRetryVerification && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onRetryVerification(verification.id)}
                              className="font-mono text-xs border-orange-300 text-orange-700 hover:bg-orange-50 bg-transparent"
                            >
                              <RefreshCw className="w-3 h-3 mr-1" />
                              Retry
                            </Button>
                          )}
                      </div>
                    </div>

                    {/* Verification Details */}
                    {verification.details && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                          {verification.details.email && (
                            <div>
                              <span className="text-gray-500">Email:</span>
                              <span className="ml-2">{verification.details.email}</span>
                            </div>
                          )}
                          {verification.details.phoneNumber && (
                            <div>
                              <span className="text-gray-500">Phone:</span>
                              <span className="ml-2">{verification.details.phoneNumber}</span>
                            </div>
                          )}
                          {verification.details.documentType && (
                            <div>
                              <span className="text-gray-500">Document:</span>
                              <span className="ml-2 capitalize">{verification.details.documentType}</span>
                            </div>
                          )}
                          {verification.details.factors && (
                            <div>
                              <span className="text-gray-500">Factors:</span>
                              <span className="ml-2">{verification.details.factors.join(", ")}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Progress Bar for Individual Verification */}
                    {verification.status === "in-progress" && (
                      <div className="mt-3">
                        <Progress value={66} className="h-1" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-mono font-bold text-green-600">
              {verifications.filter((v) => v.status === "completed").length}
            </div>
            <div className="text-xs font-mono text-gray-500">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-mono font-bold text-blue-600">
              {verifications.filter((v) => v.status === "in-progress").length}
            </div>
            <div className="text-xs font-mono text-gray-500">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-mono font-bold text-yellow-600">
              {verifications.filter((v) => v.status === "pending").length}
            </div>
            <div className="text-xs font-mono text-gray-500">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-mono font-bold text-red-600">
              {verifications.filter((v) => v.status === "failed").length}
            </div>
            <div className="text-xs font-mono text-gray-500">Failed</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
