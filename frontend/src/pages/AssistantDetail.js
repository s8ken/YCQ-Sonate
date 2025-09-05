import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import FunctionsIcon from '@mui/icons-material/Functions';
import axios from 'axios';

const AssistantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNewAssistant = id === 'new';
  
  const [assistant, setAssistant] = useState({
    name: '',
    instructions: '',
    model: 'gpt-4-1106-preview'
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [functions, setFunctions] = useState([]);

  const [availableModels, setAvailableModels] = useState([
    'gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'
  ]);

  useEffect(() => {
    fetchFunctions();
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const res = await axios.get('/api/llm/models/openai');
      const list = res.data?.data?.models || [];
      if (Array.isArray(list) && list.length) {
        const models = list.map(m => m.id || m.name).filter(Boolean);
        setAvailableModels(models);
        if (!assistant.model && models.length) {
          setAssistant(prev => ({ ...prev, model: models[0] }));
        }
      }
    } catch (e) {
      // keep defaults
    }
  };

  const fetchFunctions = async () => {
    try {
      const response = await axios.get('/api/assistant/functions');
      if (response.data.success) {
        setFunctions(response.data.functions);
      }
    } catch (err) {
      console.error('Error fetching functions:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAssistant(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!assistant.name.trim()) {
      setError('Assistant name is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      const response = await axios.post('/api/assistant/create', {
        name: assistant.name,
        instructions: assistant.instructions,
        model: assistant.model
      });

      if (response.data.success) {
        setSuccess('Assistant created successfully!');
        setTimeout(() => {
          navigate('/assistants');
        }, 2000);
      }
    } catch (err) {
      console.error('Error creating assistant:', err);
      if (err.response?.status === 400 && err.response?.data?.error?.includes('OpenAI API key')) {
        setError('OpenAI API key not found. Please add your OpenAI API key in Settings.');
      } else {
        setError(err.response?.data?.details || 'Failed to create assistant. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate('/assistants');
  };

  const getDefaultInstructions = () => {
    return `You are a helpful assistant that can access and manage data in the Symbi Trust Protocol application. You have access to user profiles, agents, contexts, conversations, and trust scores. Use the available functions to help users interact with their data effectively.

When users ask about their data, use the appropriate functions to retrieve and present the information clearly. You can help with:
- Viewing and managing agents
- Searching through contexts and knowledge base
- Reviewing conversations and trust scores
- Creating new contexts
- Updating agent configurations

Always be helpful, accurate, and respect user privacy.`;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={handleBack} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {isNewAssistant ? 'Create Assistant' : 'Edit Assistant'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isNewAssistant ? 'Create a new OpenAI Assistant with access to your app data' : 'Modify your assistant configuration'}
          </Typography>
        </Box>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Main Configuration */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <SmartToyIcon sx={{ mr: 1 }} />
              Assistant Configuration
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Assistant Name"
                  name="name"
                  value={assistant.name}
                  onChange={handleChange}
                  required
                  margin="normal"
                  placeholder="My Symbi Assistant"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Model</InputLabel>
                  <Select
                    name="model"
                    value={assistant.model}
                    onChange={handleChange}
                    label="Model"
                  >
                    {availableModels.map(model => (
                      <MenuItem key={model} value={model}>
                        {model}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Instructions"
                  name="instructions"
                  value={assistant.instructions}
                  onChange={handleChange}
                  multiline
                  rows={12}
                  margin="normal"
                  placeholder={getDefaultInstructions()}
                  helperText="Define your assistant's personality, capabilities, and behavior. Leave empty to use default instructions."
                />
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Creating...' : 'Create Assistant'}
              </Button>
              
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={saving}
              >
                Cancel
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Available Functions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <FunctionsIcon sx={{ mr: 1 }} />
              Available Functions
            </Typography>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              Your assistant will have access to these functions to interact with your app data:
            </Typography>
            
            <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
              {functions.map((func, index) => (
                <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {func.function.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                      {func.function.description}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
            
            {functions.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                Loading functions...
              </Typography>
            )}
          </Paper>
          
          {/* Tips */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              💡 Tips
            </Typography>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              • Give your assistant a clear, descriptive name
            </Typography>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              • Use specific instructions to guide behavior
            </Typography>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              • The assistant can call functions to access your data
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              • Test your assistant after creation to ensure it works as expected
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AssistantDetail;
