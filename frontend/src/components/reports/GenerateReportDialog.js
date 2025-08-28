import React, { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import AssessmentIcon from '@mui/icons-material/Assessment';
import axios from 'axios';
import '../../styles/builder.css';

const GenerateReportDialog = ({ open, onClose, onSuccess }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'audit',
    content: '',
    metadata: {
      tags: [],
      description: ''
    }
  });
  
  const [newTag, setNewTag] = useState('');
  const [reportType, setReportType] = useState('daily');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleAddTag = () => {
    if (newTag.trim() && !formData.metadata.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          tags: [...prev.metadata.tags, newTag.trim()]
        }
      }));
      setNewTag('');
    }
  };
  
  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        tags: prev.metadata.tags.filter(tag => tag !== tagToRemove)
      }
    }));
  };
  
  const handleGenerateReport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let response;
      
      if (reportType === 'daily') {
        // Generate daily report
        response = await axios.post('/api/reports/generate/daily');
      } else {
        // Create custom report
        response = await axios.post('/api/reports', formData);
      }
      
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      onClose();
    } catch (err) {
      console.error('Error generating report:', err);
      setError(err.response?.data?.message || 'Failed to generate report');
    } finally {
      setLoading(false);
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
          borderTop: `4px solid ${theme.palette.info.main}`,
          borderRadius: '4px'
        }
      }}
    >
      <DialogTitle sx={{ pr: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AssessmentIcon sx={{ mr: 1 }} />
          Generate Report
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
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Report Type</InputLabel>
          <Select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            label="Report Type"
          >
            <MenuItem value="daily">Daily System Report</MenuItem>
            <MenuItem value="custom">Custom Report</MenuItem>
          </Select>
          <FormHelperText>
            {reportType === 'daily' ? 
              'Automatically generate a comprehensive daily system report' : 
              'Create a custom report with your own content'}
          </FormHelperText>
        </FormControl>
        
        {reportType === 'daily' ? (
          <Box className="report-card" sx={{ p: 3, borderRadius: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' }}>
            <Typography variant="h6" gutterBottom>
              Daily System Report
            </Typography>
            <Typography variant="body2" paragraph>
              This will generate a comprehensive report of system activity over the past 24 hours, including:
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Usage Statistics
                  </Typography>
                  <Typography variant="body2">
                    • Conversation count and volume
                    • Agent interactions
                    • API usage and performance
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    System Health
                  </Typography>
                  <Typography variant="body2">
                    • Error rates and types
                    • Response times
                    • Resource utilization
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Ethical Metrics
                  </Typography>
                  <Typography variant="body2">
                    • Ethical alignment scores
                    • Content safety analysis
                    • Trust score averages
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Recommendations
                  </Typography>
                  <Typography variant="body2">
                    • System optimization suggestions
                    • Security recommendations
                    • Usage pattern insights
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Report Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  label="Category"
                >
                  <MenuItem value="audit">Audit</MenuItem>
                  <MenuItem value="info">Information</MenuItem>
                  <MenuItem value="warning">Warning</MenuItem>
                  <MenuItem value="error">Error</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Description"
                name="metadata.description"
                value={formData.metadata.description}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Report Content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                fullWidth
                multiline
                rows={6}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Tags
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TextField
                  label="Add Tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  size="small"
                  sx={{ mr: 1 }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddTag}
                  size="small"
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {formData.metadata.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    size="small"
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        )}
        
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      
      <Divider />
      
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleGenerateReport} 
          variant="contained" 
          color="primary"
          disabled={loading || (reportType === 'custom' && (!formData.title || !formData.content))}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            reportType === 'daily' ? 'Generate Daily Report' : 'Create Report'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GenerateReportDialog;