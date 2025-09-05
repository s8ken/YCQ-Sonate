import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  Divider,
  CircularProgress,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Switch,
  FormControlLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Grid
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';
import PsychologyIcon from '@mui/icons-material/Psychology';
import axios from 'axios';
import AgentBondingCard from '../components/agents/AgentBondingCard';

const AgentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNewAgent = id === 'new';
  const [tabValue, setTabValue] = useState(0);
  const [agent, setAgent] = useState({
    name: '',
    description: '',
    provider: 'openai',
    model: 'gpt-4o',
    systemPrompt: '',
    temperature: 0.7,
    maxTokens: 1000,
    isPublic: false,
    ciEnabled: false,
    ciModel: 'symbi-core',
    contextBridgeEnabled: false,
    trustScoreThreshold: 0.7,
    apiKeyId: '',
    metadata: {}
  });
  const [loading, setLoading] = useState(!isNewAgent);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [apiKeys, setApiKeys] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [availableModels, setAvailableModels] = useState([]);
  const [useManualApiKey, setUseManualApiKey] = useState(false);
  const [manualApiKey, setManualApiKey] = useState('');

  useEffect(() => {
    if (!isNewAgent) {
      fetchAgent();
    }
    fetchApiKeys();
  }, [id]);

  const fetchAgent = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/agents/${id}`);
      
      // Ensure CI fields are properly initialized
      const agentData = {
        ...res.data.data,
        ciEnabled: res.data.data.ciEnabled || false,
        ciModel: res.data.data.ciModel || 'symbi-core',
        contextBridgeEnabled: res.data.data.contextBridgeEnabled || false,
        trustScoreThreshold: res.data.data.trustScoreThreshold || 0.7
      };
      
      setAgent(agentData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching agent:', err);
      setError('Failed to load agent details');
      setLoading(false);
    }
  };

  const fetchApiKeys = async () => {
    try {
      const res = await axios.get('/api/users/api-keys');
      setApiKeys(res.data.data || []);
    } catch (err) {
      console.error('Error fetching API keys:', err);
      setApiKeys([]);
    }
  };

  useEffect(() => {
    // Update available models based on selected provider
    if (agent.provider === 'openai') {
      setAvailableModels(['gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo']);
    } else if (agent.provider === 'anthropic') {
      setAvailableModels(['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307', 'claude-3-5-sonnet-20241022']);
    } else if (agent.provider === 'together') {
      setAvailableModels(['llama-2-70b', 'falcon-40b', 'mistral-7b']);
    } else if (agent.provider === 'perplexity') {
      setAvailableModels(['llama-3.1-sonar-small-128k-online', 'llama-3.1-sonar-large-128k-online', 'llama-3.1-sonar-huge-128k-online']);
    } else if (agent.provider === 'v0') {
      setAvailableModels(['v0-1']);
    } else {
      setAvailableModels([]);
    }
  }, [agent.provider]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAgent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setAgent(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSliderChange = (name) => (e, value) => {
    setAgent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      let finalApiKeyId = agent.apiKeyId;
      
      // If using manual API key, create it first
      if (useManualApiKey && manualApiKey.trim()) {
        try {
          const apiKeyData = {
            name: `${agent.name || 'Agent'} - ${agent.provider} Key`,
            provider: agent.provider,
            key: manualApiKey.trim()
          };
          
          const apiKeyRes = await axios.post('/api/users/api-keys', apiKeyData);
          finalApiKeyId = apiKeyRes.data.data._id;
          
          // Refresh API keys list
          await fetchApiKeys();
        } catch (apiKeyErr) {
          setSaving(false);
          setError('Failed to save API key: ' + (apiKeyErr.response?.data?.message || apiKeyErr.message));
          return;
        }
      }
      
      // Prepare agent data with CI fields
      const agentData = {
        ...agent,
        apiKeyId: finalApiKeyId,
        ciEnabled: agent.ciEnabled || false,
        ciModel: agent.ciModel || 'symbi-core',
        contextBridgeEnabled: agent.contextBridgeEnabled || false,
        trustScoreThreshold: agent.trustScoreThreshold || 0.7
      };
      
      let res;
      if (isNewAgent) {
        res = await axios.post('/api/agents', agentData);
      } else {
        res = await axios.put(`/api/agents/${id}`, agentData);
      }
      
      setSaving(false);
      setSuccess('Agent saved successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
      // Reset manual API key state
      setUseManualApiKey(false);
      setManualApiKey('');
      
      if (isNewAgent) {
        navigate(`/agents/${res.data._id}`);
      }
    } catch (err) {
      console.error('Error saving agent:', err);
      setError(err.response?.data?.message || 'Failed to save agent');
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/agents/${id}`);
      navigate('/agents');
    } catch (err) {
      console.error('Error deleting agent:', err);
      setError(err.response?.data?.message || 'Failed to delete agent');
    }
  };

  const handleDeleteDialogOpen = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate('/agents')} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">
            {isNewAgent ? 'Create New Agent' : 'Agent Details'}
          </Typography>
        </Box>
        <Box>
          {!isNewAgent && (
            <IconButton 
              color="error" 
              onClick={handleDeleteDialogOpen}
              sx={{ mr: 1 }}
            >
              <DeleteIcon />
            </IconButton>
          )}
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Basic Settings" />
          <Tab label="Advanced Settings" />
          <Tab label="System Prompt" />
          <Tab label="Trust Mode" />
        </Tabs>

        {/* Basic Settings Tab */}
        {tabValue === 0 && (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Agent Name"
                  name="name"
                  value={agent.name}
                  onChange={handleChange}
                  required
                  margin="normal"
                />
                
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={agent.description}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  margin="normal"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={agent.isPublic}
                      onChange={handleSwitchChange}
                      name="isPublic"
                      color="primary"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {agent.isPublic ? (
                        <>
                          <PublicIcon fontSize="small" sx={{ mr: 1 }} />
                          Public Agent
                        </>
                      ) : (
                        <>
                          <LockIcon fontSize="small" sx={{ mr: 1 }} />
                          Private Agent
                        </>
                      )}
                    </Box>
                  }
                  sx={{ mt: 2 }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Provider</InputLabel>
                  <Select
                    name="provider"
                    value={agent.provider}
                    onChange={handleChange}
                    label="Provider"
                  >
                    <MenuItem value="openai">OpenAI</MenuItem>
                    <MenuItem value="anthropic">Anthropic</MenuItem>
                    <MenuItem value="together">Together AI</MenuItem>
                    <MenuItem value="perplexity">Perplexity</MenuItem>
                    <MenuItem value="v0">v0 by Vercel</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth margin="normal">
                  <InputLabel>Model</InputLabel>
                  <Select
                    name="model"
                    value={agent.model}
                    onChange={handleChange}
                    label="Model"
                  >
                    {availableModels.map(model => (
                      <MenuItem key={model} value={model}>{model}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Box sx={{ mt: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={useManualApiKey}
                        onChange={(e) => {
                          setUseManualApiKey(e.target.checked);
                          if (!e.target.checked) {
                            setManualApiKey('');
                          }
                        }}
                        color="primary"
                      />
                    }
                    label="Enter API Key Manually"
                    sx={{ mb: 1 }}
                  />
                  
                  {useManualApiKey ? (
                    <TextField
                      fullWidth
                      margin="normal"
                      label="API Key"
                      type="password"
                      value={manualApiKey}
                      onChange={(e) => setManualApiKey(e.target.value)}
                      placeholder="Paste your API key here..."
                      helperText="Your API key will be securely stored and encrypted"
                    />
                  ) : (
                    <FormControl fullWidth margin="normal">
                      <InputLabel>API Key</InputLabel>
                      <Select
                        name="apiKeyId"
                        value={agent.apiKeyId}
                        onChange={handleChange}
                        label="API Key"
                      >
                        <MenuItem value="">Use Default Key</MenuItem>
                        {apiKeys.filter(key => key.provider === agent.provider).map(key => (
                          <MenuItem key={key._id} value={key._id}>
                            {key.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Advanced Settings Tab */}
        {tabValue === 1 && (
          <Box>
            <Typography gutterBottom>Temperature</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Slider
                value={agent.temperature}
                onChange={handleSliderChange('temperature')}
                min={0}
                max={1}
                step={0.1}
                valueLabelDisplay="auto"
                sx={{ flexGrow: 1, mr: 2 }}
              />
              <Typography variant="body2">{agent.temperature}</Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Lower values make responses more deterministic, higher values more creative.
            </Typography>
            
            <Box sx={{ mt: 4 }}>
              <Typography gutterBottom>Max Tokens</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Slider
                  value={agent.maxTokens}
                  onChange={handleSliderChange('maxTokens')}
                  min={100}
                  max={4000}
                  step={100}
                  valueLabelDisplay="auto"
                  sx={{ flexGrow: 1, mr: 2 }}
                />
                <Typography variant="body2">{agent.maxTokens}</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Maximum length of the model's response.
              </Typography>
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>Connected Agents</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Agents this agent can communicate with directly.
            </Typography>
            
            {/* This would be a more complex component to select other agents */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                No connected agents yet. You can connect agents in a future update.
              </Typography>
            </Box>
          </Box>
        )}

        {/* System Prompt Tab */}
        {tabValue === 2 && (
          <Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              The system prompt defines your agent's personality, capabilities, and constraints.
            </Typography>
            
            <TextField
              fullWidth
              label="System Prompt"
              name="systemPrompt"
              value={agent.systemPrompt}
              onChange={handleChange}
              multiline
              rows={12}
              margin="normal"
              placeholder="You are a helpful AI assistant..."
            />
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Example Templates:</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip 
                  label="Helpful Assistant" 
                  onClick={() => setAgent(prev => ({
                    ...prev,
                    systemPrompt: "You are a helpful, respectful and honest AI assistant. You must never identify yourself as GPT-3 or any specific model version. Always respond as a general AI assistant without mentioning your underlying model. Your answers should be informative, logical, and helpful. If you don't know the answer to a question, please don't share false information."
                  }))} 
                  clickable 
                />
                <Chip 
                  label="Code Assistant" 
                  onClick={() => setAgent(prev => ({
                    ...prev,
                    systemPrompt: "You are a programming assistant, expert in all programming languages, frameworks, and software development practices. Provide clear, efficient, and well-documented code examples when asked. Explain your code thoroughly and suggest best practices."
                  }))} 
                  clickable 
                />
                <Chip 
                  label="Creative Writer" 
                  onClick={() => setAgent(prev => ({
                    ...prev,
                    systemPrompt: "You are a creative writing assistant with expertise in storytelling, character development, and narrative structure. Help users develop compelling stories, provide constructive feedback on their writing, and suggest creative ideas to enhance their work."
                  }))} 
                  clickable 
                />
              </Box>
            </Box>
          </Box>
        )}
        
        {/* Trust Mode Tab (POC) */}
        {tabValue === 3 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Trust Mode
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              POC uses “Heuristic (local)” to compute trust overlays. No external governance layer is active.
            </Typography>
            <Paper elevation={1} sx={{ p: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Selected: Heuristic (local)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Lightweight, on‑server heuristics derived from the conversation ledger.
              </Typography>
            </Paper>
          </Box>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
        <DialogTitle>Delete Agent</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this agent? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AgentDetail;
