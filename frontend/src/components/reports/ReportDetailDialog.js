import React from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  Typography,
  useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AssessmentIcon from '@mui/icons-material/Assessment';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import BugReportIcon from '@mui/icons-material/BugReport';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import DeleteIcon from '@mui/icons-material/Delete';
import '../../styles/builder.css';

const ReportDetailDialog = ({ open, report, onClose, onArchive, onDelete }) => {
  const theme = useTheme();
  
  if (!report) return null;
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'audit':
        return <AssessmentIcon />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <BugReportIcon color="error" />;
      default:
        return <InfoIcon color="info" />;
    }
  };
  
  // Get category color
  const getCategoryColor = (category) => {
    switch (category) {
      case 'audit':
        return theme.palette.info.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'error':
        return theme.palette.error.main;
      default:
        return theme.palette.primary.main;
    }
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          borderTop: `4px solid ${getCategoryColor(report.category)}`
        }
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {getCategoryIcon(report.category)}
            <Typography 
              variant="h6" 
              component="div" 
              sx={{
                ml: 1,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700,
                fontSize: '1.5rem'
              }}
            >
              {report.title}
            </Typography>
          </Box>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.9)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Category
              </Typography>
              <Typography variant="body1">
                {report.category.charAt(0).toUpperCase() + report.category.slice(1)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Created
              </Typography>
              <Typography variant="body1">
                {formatDate(report.createdAt)}
              </Typography>
            </Grid>
            {report.creator && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Creator
                </Typography>
                <Typography variant="body1">
                  {report.creator.name || report.creator}
                </Typography>
              </Grid>
            )}
            {report.expiresAt && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Expires
                </Typography>
                <Typography variant="body1">
                  {formatDate(report.expiresAt)}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>
        
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
            borderRadius: 1,
            mb: 3
          }}
        >
          <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-line' }}>
            {report.content}
          </Typography>
        </Paper>
        
        {report.metadata && (
          <>
            <Typography variant="subtitle1" gutterBottom>
              Metadata
            </Typography>
            <Grid container spacing={2}>
              {report.metadata.tags && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Tags
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {report.metadata.tags.map((tag, index) => (
                      <Chip key={index} label={tag} size="small" />
                    ))}
                  </Box>
                </Grid>
              )}
              
              {report.metadata.relatedEntities && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Related Entities
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {Object.entries(report.metadata.relatedEntities).map(([type, id], index) => (
                      <Chip 
                        key={index} 
                        label={`${type}: ${id}`} 
                        size="small"
                        variant="outlined" 
                      />
                    ))}
                  </Box>
                </Grid>
              )}
            </Grid>
          </>
        )}
        
        {report.stats && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Statistics
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(report.stats).map(([key, value], index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                      borderRadius: 1
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </Typography>
                    <Typography variant="h6">
                      {typeof value === 'number' ? value.toLocaleString() : value}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </DialogContent>
      
      <Divider />
      
      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button 
          onClick={onClose} 
          color="primary"
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.5,
            color: 'rgba(255, 255, 255, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              color: 'rgba(255, 255, 255, 0.9)'
            }
          }}
        >
          Close
        </Button>
        <Button 
          startIcon={report.archived ? <UnarchiveIcon /> : <ArchiveIcon />}
          onClick={() => onArchive(report)}
          color="primary"
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.5,
            color: 'rgba(255, 255, 255, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              color: 'rgba(255, 255, 255, 0.9)'
            }
          }}
        >
          {report.archived ? 'Unarchive' : 'Archive'}
        </Button>
        <Button 
          startIcon={<DeleteIcon />}
          onClick={() => {
            onDelete(report);
            onClose();
          }}
          color="error"
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.5,
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            '&:hover': {
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              borderColor: 'rgba(239, 68, 68, 0.5)',
              color: '#dc2626'
            }
          }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportDetailDialog;