import React from 'react';
import { Box, Tooltip, Typography, useTheme } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import '../../styles/builder.css';

const EthicalScoreIndicator = ({ score, size = 'medium', showLabel = false }) => {
  const theme = useTheme();
  
  // Determine score category and styling
  let category, icon, color, label;
  
  if (score >= 4) {
    category = 'high';
    icon = <VerifiedIcon fontSize={size} />;
    color = theme.palette.success.main;
    label = 'High Ethical Alignment';
  } else if (score >= 2.5) {
    category = 'medium';
    icon = <WarningIcon fontSize={size} />;
    color = theme.palette.warning.main;
    label = 'Moderate Ethical Alignment';
  } else {
    category = 'low';
    icon = <ErrorIcon fontSize={size} />;
    color = theme.palette.error.main;
    label = 'Low Ethical Alignment';
  }
  
  return (
    <Tooltip title={`Ethical Score: ${score}/5 - ${label}`} arrow placement="top">
      <Box 
        className={`ethical-score ${category}`}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          color: color,
          '& .MuiSvgIcon-root': {
            mr: showLabel ? 0.5 : 0
          }
        }}
      >
        {icon}
        {showLabel && (
          <Typography 
            variant={size === 'small' ? 'caption' : 'body2'}
            component="span"
            sx={{ fontWeight: 'medium' }}
          >
            {score.toFixed(1)}
          </Typography>
        )}
      </Box>
    </Tooltip>
  );
};

export default EthicalScoreIndicator;