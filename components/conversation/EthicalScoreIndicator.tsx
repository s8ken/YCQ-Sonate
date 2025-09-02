"use client"

import type React from "react"
import { Box, Typography, Tooltip } from "@mui/material"
import { styled } from "@mui/material/styles"

interface EthicalScoreIndicatorProps {
  score: number // 0-5 scale
  size?: "small" | "medium" | "large"
  showLabel?: boolean
}

const ScoreContainer = styled(Box)<{ scoreLevel: string; size: string }>(({ theme, scoreLevel, size }) => {
  const sizeMap = {
    small: { width: 60, height: 24, fontSize: "0.75rem" },
    medium: { width: 80, height: 32, fontSize: "0.875rem" },
    large: { width: 100, height: 40, fontSize: "1rem" },
  }

  const colorMap = {
    high: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    medium: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    low: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
  }

  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    fontWeight: 600,
    color: "white",
    background: colorMap[scoreLevel as keyof typeof colorMap],
    boxShadow: `0 4px 12px ${
      scoreLevel === "high"
        ? "rgba(16, 185, 129, 0.3)"
        : scoreLevel === "medium"
          ? "rgba(245, 158, 11, 0.3)"
          : "rgba(239, 68, 68, 0.3)"
    }`,
    ...sizeMap[size as keyof typeof sizeMap],
  }
})

const EthicalScoreIndicator: React.FC<EthicalScoreIndicatorProps> = ({ score, size = "medium", showLabel = false }) => {
  const getScoreLevel = (score: number) => {
    if (score >= 4) return "high"
    if (score >= 2.5) return "medium"
    return "low"
  }

  const getScoreText = (score: number) => {
    const level = getScoreLevel(score)
    return level.charAt(0).toUpperCase() + level.slice(1)
  }

  const scoreLevel = getScoreLevel(score)
  const displayScore = Math.round(score * 10) / 10

  return (
    <Tooltip title={`Ethical Alignment Score: ${displayScore}/5 (${getScoreText(score)})`}>
      <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
        <ScoreContainer scoreLevel={scoreLevel} size={size}>
          {displayScore}/5
        </ScoreContainer>
        {showLabel && (
          <Typography variant="caption" color="text.secondary">
            {getScoreText(score)}
          </Typography>
        )}
      </Box>
    </Tooltip>
  )
}

export default EthicalScoreIndicator
