import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Collapse,
  Divider,
  IconButton,
  Paper,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LockIcon from '@mui/icons-material/Lock';
import SecurityIcon from '@mui/icons-material/Security';
import ContextTags from './ContextTags';
import TrustBadge from '../trust/TrustBadge';
import '../../styles/builder.css';

const MessageWithCI = ({ message, isUser, timestamp }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  
  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Handle expand/collapse
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };
  
  // Determine if message has CI metadata
  const hasCIMetadata = message.ciModel || message.trustScore || message.encryptedContent;
  
  return (
    <Card 
      sx={{ 
        mb: 2, 
        bgcolor: isUser ? 
          (theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.03)') : 
          'background.paper',
        borderLeft: hasCIMetadata ? `4px solid ${theme.palette.secondary.main}` : 'none'
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            {isUser ? 'You' : message.agentId ? 'Agent' : 'System'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {message.trustScore !== undefined && (
              <TrustBadge trustScore={message.trustScore} simplified={!expanded} />
            )}
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              {formatTime(timestamp)}
            </Typography>
          </Box>
        </Box>
        
        <Typography variant="body1" component="div" sx={{ mb: 2 }}>
          {message.encryptedContent ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LockIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
              <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                This message contains encrypted content
              </Typography>
            </Box>
          ) : (
            message.content
          )}
        </Typography>
        
        {message.contextTags && message.contextTags.length > 0 && (
          <Box sx={{ mb: 1 }}>
            <ContextTags tags={message.contextTags} maxDisplay={3} />
          </Box>
        )}
        
        {hasCIMetadata && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Tooltip title="View CI Metadata">
              <IconButton 
                onClick={handleExpandClick}
                size="small"
                sx={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }}
              >
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        )}
        
        {hasCIMetadata && (
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Divider sx={{ my: 1 }} />
            <Paper 
              elevation={0} 
              sx={{ 
                p: 1.5, 
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.03)',
                borderRadius: 1
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Cognitive Intelligence Metadata
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {message.ciModel && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" component="div">
                      CI Model
                    </Typography>
                    <Chip 
                      label={message.ciModel} 
                      size="small" 
                      variant="outlined"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                )}
                
                {message.trustScore !== undefined && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" component="div">
                      Trust Rating
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <TrustBadge trustScore={message.trustScore} />
                    </Box>
                  </Box>
                )}
                
                {message.encryptedContent && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" component="div">
                      Encryption
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SecurityIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.7 }} />
                      <Typography variant="body2">
                        End-to-end encrypted
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </Paper>
          </Collapse>
        )}
      </CardContent>
    </Card>
  );
};

export default MessageWithCI;
