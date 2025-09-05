import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Paper,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import SecurityIcon from '@mui/icons-material/Security';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import InfoIcon from '@mui/icons-material/Info';
import '../../styles/builder.css';

const ContextBridgeVisualizer = ({ contextBridge, onToggle }) => {
  const theme = useTheme();
  const [isActive, setIsActive] = useState(contextBridge?.active || false);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (contextBridge) {
      setIsActive(contextBridge.active);
    }
  }, [contextBridge]);
  
  const handleToggle = async () => {
    if (!contextBridge) return;
    
    setIsLoading(true);
    try {
      const newState = !isActive;
      setIsActive(newState);
      if (onToggle) {
        await onToggle(contextBridge._id, newState);
      }
    } catch (error) {
      console.error('Error toggling context bridge:', error);
      // Revert state on error
      setIsActive(!isActive);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!contextBridge) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="subtitle1" color="text.secondary">
            No active context bridge available
          </Typography>
        </CardContent>
      </Card>
    );
  }
  
  // Calculate trust score color
  const getTrustScoreColor = (score) => {
    if (score >= 0.8) return theme.palette.success.main;
    if (score >= 0.5) return theme.palette.warning.main;
    return theme.palette.error.main;
  };
  
  const trustScoreColor = getTrustScoreColor(contextBridge.trustScore);
  
  return (
    <Card 
      className="context-bridge-card"
      sx={{ 
        mb: 3,
        position: 'relative',
        overflow: 'visible',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: isActive ? 
            `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})` : 
            theme.palette.divider
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="div">
            Context Bridge
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Chip 
              label={isActive ? 'Active' : 'Inactive'} 
              color={isActive ? 'success' : 'default'}
              size="small"
              sx={{ mr: 1 }}
            />
            <Tooltip title={isActive ? 'Deactivate Bridge' : 'Activate Bridge'}>
              <IconButton 
                onClick={handleToggle} 
                color={isActive ? 'primary' : 'default'}
                disabled={isLoading}
              >
                {isLoading ? (
                  <CircularProgress size={24} />
                ) : isActive ? (
                  <LinkIcon />
                ) : (
                  <LinkOffIcon />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.02)',
                borderRadius: 2,
                height: '100%'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    bgcolor: theme.palette.primary.main,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    mr: 1
                  }}
                >
                  <Typography variant="subtitle2">S</Typography>
                </Box>
                <Typography variant="subtitle1">Symbi</Typography>
              </Box>
              <Typography variant="body2" paragraph>
                Local context management system with enhanced privacy controls.
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <SecurityIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.7 }} />
                <Typography variant="caption" color="text.secondary">
                  End-to-end encrypted
                </Typography>
              </Box>
            </Paper>
          </Grid>
          
          {/* POC: no external systems visualized */}
        </Grid>
        
        <Box 
          className="bridge-connection"
          sx={{ 
            my: 2, 
            height: 4, 
            background: isActive ? 
              `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})` : 
              theme.palette.divider,
            position: 'relative'
          }}
        >
          <Box 
            sx={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)',
              bgcolor: theme.palette.background.paper,
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `2px solid ${isActive ? trustScoreColor : theme.palette.divider}`
            }}
          >
            <Tooltip 
              title={
                <Box>
                  <Typography variant="caption" sx={{ display: 'block' }}>
                    Trust Score: {(contextBridge.trustScore * 100).toFixed(0)}%
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', opacity: 0.8 }}>
                    Based on ethical alignment and data integrity
                  </Typography>
                </Box>
              } 
              arrow
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: isActive ? trustScoreColor : theme.palette.text.disabled
                  }}
                >
                  {(contextBridge.trustScore * 100).toFixed(0)}%
                </Typography>
              </Box>
            </Tooltip>
          </Box>
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Active Context Tags
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {contextBridge.tags?.map((tag, index) => (
              <Chip 
                key={index} 
                label={tag} 
                size="small" 
                variant="outlined"
              />
            )) || (
              <Typography variant="body2" color="text.secondary">
                No active context tags
              </Typography>
            )}
          </Box>
        </Box>
        
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
          <InfoIcon fontSize="small" sx={{ mr: 0.5, color: theme.palette.info.main }} />
          <Typography variant="caption" color="text.secondary">
            Context shows the sources SYMBI uses (project notes, links, and session capsules)
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ContextBridgeVisualizer;
