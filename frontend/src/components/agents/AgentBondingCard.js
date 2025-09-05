import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  Divider,
  Typography,
  useTheme
} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import BondingRitual from '../bonding/BondingRitual';
import '../../styles/builder.css';

const AgentBondingCard = ({ agent, onBondingComplete }) => {
  const theme = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const handleOpenDialog = () => {
    setDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  
  const handleBondingComplete = (result) => {
    handleCloseDialog();
    if (onBondingComplete && result) {
      onBondingComplete(result);
    }
  };
  
  // Determine bonding status display
  const getBondingStatusDisplay = () => {
    if (!agent) return { text: 'Unknown', color: 'default' };
    
    switch (agent.bondingStatus) {
      case 'bonded':
        return { text: 'Bonded', color: 'success' };
      case 'pending':
        return { text: 'Bonding Pending', color: 'warning' };
      case 'failed':
        return { text: 'Bonding Failed', color: 'error' };
      default:
        return { text: 'Not Bonded', color: 'default' };
    }
  };
  
  const bondingStatus = getBondingStatusDisplay();
  
  return (
    <>
      <Card sx={{ mb: 3 }}>
        <CardHeader 
          title="Agent Bonding"
          action={
            <Chip 
              label={bondingStatus.text}
              color={bondingStatus.color}
              size="small"
            />
          }
        />
        <Divider />
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" paragraph>
              Bonding creates alignment between you and your AI agent, enabling enhanced contextual awareness and ethical decision making.
            </Typography>
            
            {agent && agent.bondingStatus === 'bonded' ? (
              <Box className="bonding-cta" sx={{ p: 2, borderRadius: 2, textAlign: 'center' }}>
                <Typography variant="subtitle1" gutterBottom>
                  <LinkIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Bond Established
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You have a strong bond with {agent.name}. This enables enhanced contextual awareness and ethical decision making.
                </Typography>
              </Box>
            ) : (
              <Box className="bonding-cta" sx={{ p: 2, borderRadius: 2, textAlign: 'center' }}>
                <Typography variant="subtitle1" gutterBottom>
                  <LinkOffIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  No Bond Established
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Establish a bond with {agent ? agent.name : 'this agent'} to unlock enhanced capabilities.
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={handleOpenDialog}
                  disabled={!agent || agent.bondingStatus === 'pending'}
                >
                  {agent && agent.bondingStatus === 'pending' ? 'Bonding in Progress' : 'Initiate Bonding'}
                </Button>
              </Box>
            )}
          </Box>
          
          {agent && agent.bondingStatus === 'bonded' && agent.traits && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Agent Traits
              </Typography>
              <Box className="cosmic-bg" sx={{ p: 2, borderRadius: 2, color: 'white' }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ minWidth: 120 }}>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      Ethical Alignment
                    </Typography>
                    <Typography variant="h6">
                      {agent.traits.ethical_alignment || 3}/5
                    </Typography>
                  </Box>
                  <Box sx={{ minWidth: 120 }}>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      Creativity
                    </Typography>
                    <Typography variant="h6">
                      {agent.traits.creativity || 3}/5
                    </Typography>
                  </Box>
                  <Box sx={{ minWidth: 120 }}>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      Precision
                    </Typography>
                    <Typography variant="h6">
                      {agent.traits.precision || 3}/5
                    </Typography>
                  </Box>
                  <Box sx={{ minWidth: 120 }}>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      Adaptability
                    </Typography>
                    <Typography variant="h6">
                      {agent.traits.adaptability || 3}/5
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
      
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <BondingRitual 
          agent={agent} 
          onComplete={handleBondingComplete} 
        />
      </Dialog>
    </>
  );
};

export default AgentBondingCard;