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
      PaperProps={{
        sx: {
          borderTop: `4px solid ${getCategoryColor(report.category)}`,
          borderRadius: '4px'
        }
      }}
    >
      <DialogTitle sx={{ pr: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {getCategoryIcon(report.category)}
          <Typography variant="h6" component="div" sx={{ ml: 1 }}>
            {report.title}
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
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
      
      <DialogActions>
        <Button 
          startIcon={report.archived ? <UnarchiveIcon /> : <ArchiveIcon />}
          onClick={() => onArchive(report)}
          color="primary"
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
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportDetailDialog;