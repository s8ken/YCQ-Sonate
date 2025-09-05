import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';

const ConversationGuard = ({ children }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Validate conversation ID format
    if (!id || id === 'undefined' || id === 'null' || id.trim() === '') {
      console.warn('Invalid conversation ID detected:', id);
      navigate('/conversations', { replace: true });
      return;
    }

    // Check if ID looks like a valid MongoDB ObjectId (24 hex characters)
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(id)) {
      console.warn('Invalid conversation ID format:', id);
      navigate('/conversations', { replace: true });
      return;
    }
  }, [id, navigate]);

  // Show loading while validating
  if (!id || id === 'undefined' || id === 'null' || id.trim() === '') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Check ObjectId format
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  if (!objectIdRegex.test(id)) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error" variant="h6" gutterBottom>
          Invalid Conversation ID
        </Typography>
        <Typography color="text.secondary">
          Redirecting to conversations...
        </Typography>
      </Box>
    );
  }

  return children;
};

export default ConversationGuard;