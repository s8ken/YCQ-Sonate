"use client"

import type React from "react"
import { useState } from "react"
import { Box, Chip, IconButton, Tooltip } from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import ExpandLessIcon from "@mui/icons-material/ExpandLess"

interface ContextTag {
  id: string
  label: string
  category?: string
  confidence?: number
}

interface ContextTagsProps {
  tags: ContextTag[]
  maxDisplay?: number
}

const ContextTags: React.FC<ContextTagsProps> = ({ tags, maxDisplay = 3 }) => {
  const [expanded, setExpanded] = useState(false)

  if (!tags || tags.length === 0) return null

  const visibleTags = expanded ? tags : tags.slice(0, maxDisplay)
  const hasMoreTags = tags.length > maxDisplay

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case "technical":
        return "#3b82f6"
      case "ethical":
        return "#10b981"
      case "context":
        return "#8b5cf6"
      case "security":
        return "#ef4444"
      default:
        return "#6b7280"
    }
  }

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, alignItems: "center" }}>
      {visibleTags.map((tag) => (
        <Tooltip key={tag.id} title={tag.confidence ? `Confidence: ${Math.round(tag.confidence * 100)}%` : ""}>
          <Chip
            label={tag.label}
            size="small"
            sx={{
              bgcolor: getCategoryColor(tag.category),
              color: "white",
              fontSize: "0.7rem",
              height: 20,
              "& .MuiChip-label": {
                px: 1,
              },
            }}
          />
        </Tooltip>
      ))}

      {hasMoreTags && (
        <IconButton
          size="small"
          onClick={() => setExpanded(!expanded)}
          sx={{
            width: 20,
            height: 20,
            color: "text.secondary",
          }}
        >
          {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </IconButton>
      )}
    </Box>
  )
}

export default ContextTags
