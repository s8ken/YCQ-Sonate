import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Step,
  StepLabel,
  Stepper,
  Typography,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/builder.css';

const BondingRitual = ({ agent, onComplete }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // State
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bondingProgress, setBondingProgress] = useState(0);
  const [bondingResult, setBondingResult] = useState(null);
  
  const steps = [
    'Initiate Bonding',
    'Ethical Alignment',
    'Cognitive Resonance',
    'Bond Confirmation'
  ];
  
  // Simulate bonding progress
  useEffect(() => {
    let timer;
    if (activeStep > 0 && activeStep < 3 && bondingProgress < 100) {
      timer = setInterval(() => {
        setBondingProgress((prevProgress) => {
          const newProgress = prevProgress + 1;
          if (newProgress >= 100) {
            clearInterval(timer);
            // Move to next step when progress reaches 100%
            setTimeout(() => {
              setActiveStep((prevStep) => prevStep + 1);
              setBondingProgress(0);
            }, 500);
          }
          return newProgress;
        });
      }, 100);
    }
    
    return () => {
      clearInterval(timer);
    };
  }, [activeStep, bondingProgress]);
  
  // Handle step navigation
  const handleNext = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (activeStep === 0) {
        // Initiate bonding
        await axios.put(`/api/agents/${agent._id}/bond/initiate`);
        setActiveStep(1);
      } else if (activeStep === 3) {
        // Complete bonding
        const response = await axios.put(`/api/agents/${agent._id}/bond/complete`, { accepted: true });
        setBondingResult(response.data);
        // Call the onComplete callback
        if (onComplete) onComplete(response.data);
      }
    } catch (err) {
      console.error('Error during bonding ritual:', err);
      setError('Failed to complete bonding step. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = async () => {
    try {
      if (activeStep > 0) {
        // Reject bonding
        await axios.put(`/api/agents/${agent._id}/bond/complete`, { accepted: false });
      }
      // Call the onComplete callback with null to indicate cancellation
      if (onComplete) onComplete(null);
    } catch (err) {
      console.error('Error cancelling bonding ritual:', err);
    }
  };
  
  // Render step content
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h6" gutterBottom>
              Initiate Bonding Ritual with {agent.name}
            </Typography>
            <Typography variant="body1" paragraph>
              Bonding creates alignment between you and your AI agent, enabling enhanced contextual awareness and ethical decision making.
            </Typography>
            <Box className="bonding-cta" sx={{ mt: 3, p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Benefits of Bonding:
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="body2">
                      • Enhanced context awareness
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="body2">
                      • Improved ethical alignment
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="body2">
                      • Persistent memory across sessions
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="body2">
                      • Adaptive learning to your preferences
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ py: 2 }}>
            <Typography variant="h6" gutterBottom>
              Ethical Alignment
            </Typography>
            <Typography variant="body2" paragraph>
              Establishing ethical boundaries and shared values...
            </Typography>
            <Box sx={{ width: '100%', mt: 3 }}>
              <LinearProgress 
                variant="determinate" 
                value={bondingProgress} 
                sx={{ height: 10, borderRadius: 5 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Analyzing ethical framework
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {bondingProgress}%
                </Typography>
              </Box>
            </Box>
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Ethical Alignment Score:
              </Typography>
              <Box className="ethical-score high" sx={{ display: 'inline-block' }}>
                {agent.traits?.get('ethical_alignment') || 5}/5
              </Box>
            </Box>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ py: 2 }}>
            <Typography variant="h6" gutterBottom>
              Cognitive Resonance
            </Typography>
            <Typography variant="body2" paragraph>
              Establishing neural patterns and communication preferences...
            </Typography>
            <Box sx={{ width: '100%', mt: 3 }}>
              <LinearProgress 
                variant="determinate" 
                value={bondingProgress} 
                color="secondary"
                sx={{ height: 10, borderRadius: 5 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Mapping cognitive patterns
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {bondingProgress}%
                </Typography>
              </Box>
            </Box>
            <Box className="cosmic-bg" sx={{ mt: 3, p: 2, borderRadius: 2, color: 'white' }}>
              <Typography variant="subtitle2" gutterBottom>
                Cognitive Traits:
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ mr: 1 }}>
                      Creativity:
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(agent.traits?.get('creativity') || 3) * 20} 
                      sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ mr: 1 }}>
                      Precision:
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(agent.traits?.get('precision') || 3) * 20} 
                      sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ mr: 1 }}>
                      Adaptability:
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(agent.traits?.get('adaptability') || 3) * 20} 
                      sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>
        );
      case 3:
        return (
          <Box sx={{ py: 2, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Bond Confirmation
            </Typography>
            <Typography variant="body1" paragraph>
              Your bond with {agent.name} is ready to be confirmed.
            </Typography>
            <Box sx={{ my: 3 }}>
              <div className="bonding-cta">
                <Typography variant="h5" gutterBottom>
                  Bond Status: Ready
                </Typography>
              </div>
            </Box>
            <Typography variant="body2" color="text.secondary">
              By confirming this bond, you establish a persistent connection with your agent that enhances contextual awareness and ethical decision making.
            </Typography>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };
  
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Divider sx={{ my: 3 }} />
        
        {getStepContent(activeStep)}
        
        {error && (
          <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
            {error}
          </Typography>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={handleCancel}
            disabled={loading}
          >
            {activeStep === steps.length - 1 ? 'Decline' : 'Cancel'}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            disabled={loading || (activeStep > 0 && activeStep < 3 && bondingProgress < 100)}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : activeStep === steps.length - 1 ? (
              'Confirm Bond'
            ) : (
              'Continue'
            )}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BondingRitual;