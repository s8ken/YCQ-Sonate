import React, { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import '../../styles/builder.css';

const CreateContextBridgeDialog = ({ open, onClose, onSubmit }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    tags: [],
    source: 'symbi',
    data: '',
    relatedEntities: {
      conversation: '',
      agent: '',
      report: ''
    },
    metadata: {
      description: '',
      priority: 'medium'
    },
    trustScore: 0.8,
    expiresAt: null,
    active: true
  });
  
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState({});
  
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
  
  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };
  
  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (formData.tags.length === 0) {
      newErrors.tags = 'At least one tag is required';
    }
    
    if (!formData.data.trim()) {
      newErrors.data = 'Context data is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
      onClose();
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
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography 
            variant="h6"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
              fontSize: '1.5rem'
            }}
          >
            Create Context Bridge
          </Typography>
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
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Context Tags
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TextField
                label="Add Tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                size="small"
                sx={{ 
                  mr: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.2)'
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(102, 126, 234, 0.5)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                      borderWidth: 2
                    },
                    '& input': {
                      color: 'rgba(255, 255, 255, 0.9)'
                    },
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                    '&.Mui-focused': {
                      color: '#667eea'
                    }
                  }
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                error={!!errors.tags}
                helperText={errors.tags}
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
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
              {formData.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  size="small"
                />
              ))}
              {formData.tags.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No tags added yet. Tags help categorize and retrieve context.
                </Typography>
              )}
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)', '&.Mui-focused': { color: '#667eea' } }}>Source</InputLabel>
              <Select
                name="source"
                value={formData.source}
                onChange={handleChange}
                label="Source"
                sx={{
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.2)'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(102, 126, 234, 0.5)'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#667eea',
                    borderWidth: 2
                  },
                  '& .MuiSelect-select': {
                    color: 'rgba(255, 255, 255, 0.9)'
                  },
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                }}
              >
                <MenuItem value="symbi">Symbi</MenuItem>
              </Select>
              <FormHelperText>
                The system that originated this context
              </FormHelperText>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              label="Trust Score"
              name="trustScore"
              type="number"
              value={formData.trustScore}
              onChange={handleChange}
              fullWidth
              inputProps={{ min: 0, max: 1, step: 0.1 }}
              helperText="Trust score between 0 and 1"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.2)'
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(102, 126, 234, 0.5)'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                    borderWidth: 2
                  },
                  '& input': {
                    color: 'rgba(255, 255, 255, 0.9)'
                  },
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-focused': {
                    color: '#667eea'
                  }
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Context Data"
              name="data"
              value={formData.data}
              onChange={handleChange}
              fullWidth
              multiline
              rows={4}
              error={!!errors.data}
              helperText={errors.data || 'The actual context information to be shared'}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.2)'
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(102, 126, 234, 0.5)'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                    borderWidth: 2
                  },
                  '& textarea': {
                    color: 'rgba(255, 255, 255, 0.9)'
                  },
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-focused': {
                    color: '#667eea'
                  }
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Related Entities
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Conversation ID"
                  name="relatedEntities.conversation"
                  value={formData.relatedEntities.conversation}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Agent ID"
                  name="relatedEntities.agent"
                  value={formData.relatedEntities.agent}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Report ID"
                  name="relatedEntities.report"
                  value={formData.relatedEntities.report}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>
            </Grid>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              label="Description"
              name="metadata.description"
              value={formData.metadata.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={2}
              helperText="Optional description of this context"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                name="metadata.priority"
                value={formData.metadata.priority}
                onChange={handleChange}
                label="Priority"
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
              <FormHelperText>
                Priority level for this context
              </FormHelperText>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.active}
                  onChange={handleSwitchChange}
                  name="active"
                  color="primary"
                />
              }
              label="Active"
            />
            <FormHelperText>
              Whether this context is currently active in the bridge
            </FormHelperText>
          </Grid>
        </Grid>
      </DialogContent>
      
      <Divider />
      
      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button 
          onClick={onClose} 
          color="inherit"
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
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            borderRadius: 2,
            px: 4,
            py: 1.5,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
              boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)',
              transform: 'translateY(-2px)'
            },
            '&:active': {
              transform: 'translateY(0px)',
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
            },
            fontWeight: 600,
            fontSize: '0.95rem'
          }}
          >
            Add Context
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateContextBridgeDialog;
