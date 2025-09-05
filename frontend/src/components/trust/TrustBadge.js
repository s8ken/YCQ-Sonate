import React from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ShieldIcon from '@mui/icons-material/Shield';
import SecurityIcon from '@mui/icons-material/Security';

const TrustBadge = ({ trustScore, simplified = false }) => {
  // Convert any trust score to a 0-100 scale for consistency
  const normalizedScore = typeof trustScore === 'number' 
    ? Math.round(trustScore * 100) 
    : null;
  
  // Determine badge appearance based on score
  let icon, color, label, description;
  
  if (normalizedScore === null) {
    return null; // No badge if no score
  } else if (normalizedScore >= 80) {
    icon = <VerifiedUserIcon />;
    color = '#4caf50'; // green
    label = 'Trusted';
    description = 'This content has a high trust score';
  } else if (normalizedScore >= 60) {
    icon = <ShieldIcon />;
    color = '#2196f3'; // blue
    label = 'Reliable';
    description = 'This content has a good trust score';
  } else if (normalizedScore >= 40) {
    icon = <ShieldIcon />;
    color = '#ff9800'; // orange
    label = 'Moderate';
    description = 'This content has a moderate trust score';
  } else {
    icon = <SecurityIcon />;
    color = '#f44336'; // red
    label = 'Caution';
    description = 'This content has a low trust score';
  }
  
  // Simplified version just shows the icon with tooltip
  if (simplified) {
    return (
      <Tooltip title={`${label}: ${normalizedScore}%`} arrow>
        <Box sx={{ color, display: 'flex', alignItems: 'center' }}>
          {icon}
        </Box>
      </Tooltip>
    );
  }
  
  // Full version shows icon, label and score
  return (
    <Tooltip title={description} arrow>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        bgcolor: `${color}20`, 
        color,
        px: 1.5,
        py: 0.5,
        borderRadius: 4,
        border: `1px solid ${color}`
      }}>
        <Box sx={{ mr: 0.5 }}>{icon}</Box>
        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ ml: 0.5, opacity: 0.8 }}>
          {normalizedScore}%
        </Typography>
      </Box>
    </Tooltip>
  );
};

export default TrustBadge;
