import React, { forwardRef } from 'react';
import { Snackbar, Alert as MuiAlert, Typography, Box, useTheme } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import '../../styles/builder.css';

const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const ToastNotification = ({ open, message, severity, onClose, autoHideDuration = 6000, title }) => {
  const theme = useTheme();
  
  const getIcon = () => {
    switch (severity) {
      case 'success':
        return <CheckCircleIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'info':
      default:
        return <InfoIcon />;
    }
  };
  
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      className="toast-notification"
    >
      <Alert 
        onClose={onClose} 
        severity={severity} 
        sx={{ 
          width: '100%',
          '& .MuiAlert-icon': {
            alignItems: 'center'
          }
        }}
      >
        {title ? (
          <Box>
            <Typography variant="subtitle2" component="div">
              {title}
            </Typography>
            <Typography variant="body2">
              {message}
            </Typography>
          </Box>
        ) : (
          message
        )}
      </Alert>
    </Snackbar>
  );
};

export default ToastNotification;