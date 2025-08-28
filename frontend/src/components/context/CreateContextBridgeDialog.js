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
      PaperProps={{
        sx: {
          borderTop: `4px solid ${theme.palette.primary.main}`,
          borderRadius: '4px'
        }
      }}
    >
      <DialogTitle sx={{ pr: 6 }}>
        Create Context Bridge
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
                sx={{ mr: 1 }}
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
              <InputLabel>Source System</InputLabel>
              <Select
                name="source"
                value={formData.source}
                onChange={handleChange}
                label="Source System"
              >
                <MenuItem value="symbi">Symbi</MenuItem>
                <MenuItem value="overseer">Overseer</MenuItem>
                <MenuItem value="system">System</MenuItem>
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
      
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
        >
          Create Context Bridge
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateContextBridgeDialog;