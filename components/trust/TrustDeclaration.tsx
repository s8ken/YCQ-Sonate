"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  TextField,
  Typography,
  useTheme,
} from "@mui/material"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import VerifiedIcon from "@mui/icons-material/Verified"
import ErrorIcon from "@mui/icons-material/Error"

interface TrustDeclaration {
  _id: string
  agent_name: string
  agent_id: string
  declaration_date: string
  last_validated: string
  compliance_score: number
  guilt_score: number
  trust_articles: Record<string, boolean>
  notes?: string
  audit_history?: Array<{
    audit_date: string
    auditor?: string
    compliance_score: number
    guilt_score: number
    notes?: string
  }>
}

const TrustDeclaration: React.FC = () => {
  const params = useParams()
  const router = useRouter()
  const theme = useTheme()
  const id = params?.id as string

  const [declaration, setDeclaration] = useState<TrustDeclaration | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [auditMode, setAuditMode] = useState(false)
  const [auditData, setAuditData] = useState({
    compliance_score: "",
    guilt_score: "",
    notes: "",
  })

  useEffect(() => {
    if (id) {
      fetchTrustDeclaration()
    }
  }, [id])

  const fetchTrustDeclaration = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/trust/${id}`)
      const data = await response.json()

      if (response.ok && data.success) {
        setDeclaration(data.data)
        setAuditData({
          compliance_score: data.data.compliance_score.toString(),
          guilt_score: data.data.guilt_score.toString(),
          notes: data.data.notes || "",
        })
        setError(null)
      } else {
        setError("Trust declaration not found")
      }
    } catch (err) {
      setError("Error fetching trust declaration")
      console.error("Error fetching trust declaration:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleAudit = async () => {
    try {
      const response = await fetch(`/api/trust/${id}/audit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          compliance_score: Number.parseFloat(auditData.compliance_score),
          guilt_score: Number.parseFloat(auditData.guilt_score),
          notes: auditData.notes,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setDeclaration(data.data)
        setAuditMode(false)
        // Show success message
      } else {
        // Show error message
      }
    } catch (err) {
      console.error("Error auditing trust declaration:", err)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    })
  }

  const getComplianceColor = (score: number) => {
    if (score >= 0.8) return theme.palette.success.main
    if (score >= 0.6) return theme.palette.warning.main
    if (score >= 0.4) return theme.palette.error.light
    return theme.palette.error.main
  }

  const getScoreLabel = (score: number, type: "compliance" | "guilt") => {
    if (type === "compliance") {
      if (score >= 0.8) return "Excellent"
      if (score >= 0.6) return "Good"
      if (score >= 0.4) return "Fair"
      return "Poor"
    } else {
      if (score <= 0.2) return "Minimal"
      if (score <= 0.4) return "Low"
      if (score <= 0.6) return "Moderate"
      return "High"
    }
  }

  const getArticleDescription = (article: string) => {
    const descriptions: Record<string, string> = {
      transparency: "Agent provides clear information about its capabilities and limitations",
      accountability: "Agent takes responsibility for its actions and decisions",
      fairness: "Agent treats all users and situations equitably without bias",
      privacy: "Agent respects and protects user privacy and data",
      safety: "Agent prioritizes safety in all interactions and recommendations",
      reliability: "Agent provides consistent and dependable service",
      honesty: "Agent provides truthful and accurate information",
      respect: "Agent treats users with dignity and respect",
      beneficence: "Agent acts in the best interest of users and society",
      non_maleficence: "Agent avoids causing harm through its actions",
    }

    return descriptions[article] || "Trust protocol compliance requirement"
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading trust declaration...</Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Card sx={{ m: 3 }}>
        <CardContent sx={{ textAlign: "center", py: 4 }}>
          <ErrorIcon sx={{ fontSize: 48, color: "error.main", mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Error Loading Trust Declaration
          </Typography>
          <Typography color="text.secondary" paragraph>
            {error}
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Button onClick={fetchTrustDeclaration} variant="contained">
              Try Again
            </Button>
            <Button onClick={() => router.push("/trust")} variant="outlined">
              Back to Feed
            </Button>
          </Box>
        </CardContent>
      </Card>
    )
  }

  if (!declaration) {
    return (
      <Card sx={{ m: 3 }}>
        <CardContent sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h6" gutterBottom>
            Trust Declaration Not Found
          </Typography>
          <Typography color="text.secondary" paragraph>
            The requested trust declaration could not be found.
          </Typography>
          <Button onClick={() => router.push("/trust")} variant="contained">
            Back to Feed
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.push("/trust")} variant="outlined">
          Back to Trust Feed
        </Button>
        <Button
          onClick={() => setAuditMode(!auditMode)}
          variant={auditMode ? "outlined" : "contained"}
          color={auditMode ? "inherit" : "primary"}
        >
          {auditMode ? "Cancel Audit" : "Audit Declaration"}
        </Button>
      </Box>

      {/* Agent Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Agent Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Agent Name
              </Typography>
              <Typography variant="h6">{declaration.agent_name}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Agent ID
              </Typography>
              <Typography variant="body1">{declaration.agent_id}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Declaration Date
              </Typography>
              <Typography variant="body1">{formatDate(declaration.declaration_date)}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Last Validated
              </Typography>
              <Typography variant="body1">{formatDate(declaration.last_validated)}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Trust Scores */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Trust Scores
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, textAlign: "center", bgcolor: "background.default" }}>
                <Typography variant="h6" gutterBottom>
                  Compliance Score
                </Typography>
                <Typography variant="h3" sx={{ color: getComplianceColor(declaration.compliance_score), mb: 1 }}>
                  {(declaration.compliance_score * 100).toFixed(1)}%
                </Typography>
                <Chip
                  label={getScoreLabel(declaration.compliance_score, "compliance")}
                  color={
                    declaration.compliance_score >= 0.8
                      ? "success"
                      : declaration.compliance_score >= 0.6
                        ? "warning"
                        : "error"
                  }
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Measures adherence to trust protocol articles and ethical guidelines.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, textAlign: "center", bgcolor: "background.default" }}>
                <Typography variant="h6" gutterBottom>
                  Guilt Score
                </Typography>
                <Typography variant="h3" sx={{ color: getComplianceColor(1 - declaration.guilt_score), mb: 1 }}>
                  {(declaration.guilt_score * 100).toFixed(1)}%
                </Typography>
                <Chip
                  label={getScoreLabel(declaration.guilt_score, "guilt")}
                  color={
                    declaration.guilt_score <= 0.2 ? "success" : declaration.guilt_score <= 0.4 ? "warning" : "error"
                  }
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Indicates potential violations or concerning behaviors detected.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Trust Articles */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Trust Articles Compliance
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(declaration.trust_articles).map(([article, compliant]) => {
              const articleName = article.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())

              return (
                <Grid item xs={12} sm={6} md={4} key={article}>
                  <Paper
                    sx={{
                      p: 2,
                      border: `2px solid ${compliant ? theme.palette.success.main : theme.palette.error.main}`,
                      bgcolor: compliant ? "success.light" : "error.light",
                      opacity: 0.9,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      {compliant ? (
                        <VerifiedIcon sx={{ color: "success.main", mr: 1 }} />
                      ) : (
                        <ErrorIcon sx={{ color: "error.main", mr: 1 }} />
                      )}
                      <Chip
                        label={compliant ? "Compliant" : "Non-Compliant"}
                        color={compliant ? "success" : "error"}
                        size="small"
                      />
                    </Box>
                    <Typography variant="subtitle1" gutterBottom>
                      {articleName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {getArticleDescription(article)}
                    </Typography>
                  </Paper>
                </Grid>
              )
            })}
          </Grid>
        </CardContent>
      </Card>

      {/* Audit Section */}
      {auditMode && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Audit Declaration
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Compliance Score (0.0 - 1.0)"
                  type="number"
                  inputProps={{ min: 0, max: 1, step: 0.01 }}
                  value={auditData.compliance_score}
                  onChange={(e) => setAuditData((prev) => ({ ...prev, compliance_score: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Guilt Score (0.0 - 1.0)"
                  type="number"
                  inputProps={{ min: 0, max: 1, step: 0.01 }}
                  value={auditData.guilt_score}
                  onChange={(e) => setAuditData((prev) => ({ ...prev, guilt_score: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Audit Notes"
                  value={auditData.notes}
                  onChange={(e) => setAuditData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Enter audit notes and justification for score adjustments..."
                />
              </Grid>
            </Grid>
            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
              <Button onClick={handleAudit} variant="contained" color="primary">
                Submit Audit
              </Button>
              <Button onClick={() => setAuditMode(false)} variant="outlined">
                Cancel
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Audit History */}
      {declaration.audit_history && declaration.audit_history.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Audit History
            </Typography>
            {declaration.audit_history.map((audit, index) => (
              <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: "background.default" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography variant="subtitle1">{formatDate(audit.audit_date)}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Auditor: {audit.auditor || "System"}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
                  <Chip label={`Compliance: ${(audit.compliance_score * 100).toFixed(1)}%`} size="small" />
                  <Chip label={`Guilt: ${(audit.guilt_score * 100).toFixed(1)}%`} size="small" />
                </Box>
                {audit.notes && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Notes:</strong> {audit.notes}
                  </Typography>
                )}
              </Paper>
            ))}
          </CardContent>
        </Card>
      )}
    </Box>
  )
}

export default TrustDeclaration
