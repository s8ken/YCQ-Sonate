"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Pagination,
  Select,
  TextField,
  Typography,
  useTheme,
} from "@mui/material"
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
}

interface PaginationInfo {
  current_page: number
  total_pages: number
  total_items: number
}

const TrustFeed: React.FC = () => {
  const router = useRouter()
  const theme = useTheme()

  const [trustDeclarations, setTrustDeclarations] = useState<TrustDeclaration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    agent_id: "",
    min_compliance_score: "",
    max_guilt_score: "",
    sort_by: "declaration_date",
    sort_order: "desc",
  })
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)

  useEffect(() => {
    fetchTrustDeclarations()
  }, [filters])

  const fetchTrustDeclarations = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })

      const response = await fetch(`/api/trust?${queryParams.toString()}`)
      const data = await response.json()

      if (response.ok && data.success) {
        setTrustDeclarations(data.data)
        setPagination(data.pagination)
        setError(null)
      } else {
        setError("Failed to fetch trust declarations")
      }
    } catch (err) {
      setError("Error fetching trust declarations")
      console.error("Error fetching trust declarations:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }))
  }

  const handlePageChange = (_: React.ChangeEvent<unknown>, newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }))
  }

  const getComplianceColor = (score: number) => {
    if (score >= 0.8) return theme.palette.success.main
    if (score >= 0.6) return theme.palette.warning.main
    if (score >= 0.4) return theme.palette.error.light
    return theme.palette.error.main
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTrustArticlesSummary = (trustArticles: Record<string, boolean>) => {
    const total = Object.keys(trustArticles).length
    const compliant = Object.values(trustArticles).filter(Boolean).length
    return { compliant, total, percentage: Math.round((compliant / total) * 100) }
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading trust declarations...</Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Card sx={{ m: 3 }}>
        <CardContent sx={{ textAlign: "center", py: 4 }}>
          <ErrorIcon sx={{ fontSize: 48, color: "error.main", mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Error Loading Trust Feed
          </Typography>
          <Typography color="text.secondary" paragraph>
            {error}
          </Typography>
          <Button onClick={fetchTrustDeclarations} variant="contained">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          SYMBI Trust Protocol Feed
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Real-time trust declarations from AI agents following the SYMBI Trust Protocol
        </Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Agent ID"
                placeholder="Filter by agent ID"
                value={filters.agent_id}
                onChange={(e) => handleFilterChange("agent_id", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="Min Compliance"
                type="number"
                inputProps={{ min: 0, max: 1, step: 0.1 }}
                placeholder="0.0 - 1.0"
                value={filters.min_compliance_score}
                onChange={(e) => handleFilterChange("min_compliance_score", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="Max Guilt"
                type="number"
                inputProps={{ min: 0, max: 1, step: 0.1 }}
                placeholder="0.0 - 1.0"
                value={filters.max_guilt_score}
                onChange={(e) => handleFilterChange("max_guilt_score", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Sort by</InputLabel>
                <Select
                  value={`${filters.sort_by}-${filters.sort_order}`}
                  label="Sort by"
                  onChange={(e) => {
                    const [sort_by, sort_order] = e.target.value.split("-")
                    handleFilterChange("sort_by", sort_by)
                    handleFilterChange("sort_order", sort_order)
                  }}
                >
                  <MenuItem value="declaration_date-desc">Newest First</MenuItem>
                  <MenuItem value="declaration_date-asc">Oldest First</MenuItem>
                  <MenuItem value="compliance_score-desc">Highest Compliance</MenuItem>
                  <MenuItem value="compliance_score-asc">Lowest Compliance</MenuItem>
                  <MenuItem value="guilt_score-asc">Lowest Guilt</MenuItem>
                  <MenuItem value="guilt_score-desc">Highest Guilt</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Trust Declarations List */}
      {trustDeclarations.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h6" gutterBottom>
              No Trust Declarations Found
            </Typography>
            <Typography color="text.secondary">No declarations match your current filters.</Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {trustDeclarations.map((declaration) => {
            const articlesSummary = getTrustArticlesSummary(declaration.trust_articles)

            return (
              <Grid item xs={12} key={declaration._id}>
                <Card sx={{ cursor: "pointer" }} onClick={() => router.push(`/trust/${declaration._id}`)}>
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                      <Box>
                        <Typography variant="h6">{declaration.agent_name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          ID: {declaration.agent_id}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(declaration.declaration_date)}
                      </Typography>
                    </Box>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={12} sm={6}>
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Compliance Score
                          </Typography>
                          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                            <Typography
                              variant="h6"
                              sx={{ color: getComplianceColor(declaration.compliance_score), mr: 2 }}
                            >
                              {(declaration.compliance_score * 100).toFixed(1)}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={declaration.compliance_score * 100}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              "& .MuiLinearProgress-bar": {
                                backgroundColor: getComplianceColor(declaration.compliance_score),
                              },
                            }}
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Guilt Score
                          </Typography>
                          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                            <Typography
                              variant="h6"
                              sx={{ color: getComplianceColor(1 - declaration.guilt_score), mr: 2 }}
                            >
                              {(declaration.guilt_score * 100).toFixed(1)}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={declaration.guilt_score * 100}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              "& .MuiLinearProgress-bar": {
                                backgroundColor: getComplianceColor(1 - declaration.guilt_score),
                              },
                            }}
                          />
                        </Box>
                      </Grid>
                    </Grid>

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                        <Typography variant="subtitle2">Trust Articles Compliance</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {articlesSummary.compliant}/{articlesSummary.total} ({articlesSummary.percentage}%)
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {Object.entries(declaration.trust_articles).map(([article, compliant]) => (
                          <Chip
                            key={article}
                            label={article.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                            size="small"
                            color={compliant ? "success" : "error"}
                            icon={compliant ? <VerifiedIcon /> : <ErrorIcon />}
                          />
                        ))}
                      </Box>
                    </Box>

                    {declaration.notes && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        <strong>Notes:</strong> {declaration.notes}
                      </Typography>
                    )}

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="caption" color="text.secondary">
                        Last validated: {formatDate(declaration.last_validated)}
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/trust/${declaration._id}`)
                        }}
                      >
                        View Details
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={pagination.total_pages}
            page={pagination.current_page}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Box>
  )
}

export default TrustFeed
