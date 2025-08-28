import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  FormControlLabel,
  Switch
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import KeyIcon from '@mui/icons-material/Key';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import axios from 'axios';
import CIModelSettings from '../components/settings/CIModelSettings';
import '../styles/builder.css';

const Settings = () => {
  const { user, updateUser } = useContext(AuthContext);
  const { mode, toggleTheme } = useContext(ThemeContext);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [apiKeys, setApiKeys] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [addKeyDialogOpen, setAddKeyDialogOpen] = useState(false);
  const [newApiKey, setNewApiKey] = useState({
    name: '',
    provider: 'openai',
    key: ''
  });
  const [preferences, setPreferences] = useState({
    defaultModel: 'gpt-4',
    theme: mode,
    notifications: true
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        ...profileData,
        name: user.name || '',
        email: user.email || ''
      });
      
      if (user.preferences) {
        setPreferences({
          ...preferences,
          ...user.preferences,
          theme: mode
        });
      }
      
      fetchApiKeys();
    }
  }, [user]);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/users/apikeys');
      setApiKeys(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching API keys:', err);
      setError('Failed to load API keys');
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };

  const handlePreferenceChange = (e) => {
    const { name, value } = e.target;
    setPreferences({
      ...preferences,
      [name]: value
    });
  };

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setPreferences({
      ...preferences,
      [name]: checked
    });
  };

  const handleNewApiKeyChange = (e) => {
    const { name, value } = e.target;
    setNewApiKey({
      ...newApiKey,
      [name]: value
    });
  };

  const handleAddKeyDialogOpen = () => {
    setAddKeyDialogOpen(true);
  };

  const handleAddKeyDialogClose = () => {
    setAddKeyDialogOpen(false);
    setNewApiKey({
      name: '',
      provider: 'openai',
      key: ''
    });
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate passwords if changing password
      if (profileData.newPassword) {
        if (profileData.newPassword !== profileData.confirmPassword) {
          setError('New passwords do not match');
          setLoading(false);
          return;
        }
        
        if (!profileData.currentPassword) {
          setError('Current password is required');
          setLoading(false);
          return;
        }
      }
      
      const updateData = {
        name: profileData.name,
      };
      
      // Only include password fields if changing password
      if (profileData.newPassword) {
        updateData.currentPassword = profileData.currentPassword;
        updateData.newPassword = profileData.newPassword;
      }
      
      await updateUser(updateData);
      
      setSuccess('Profile updated successfully');
      setProfileData({
        ...profileData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
      setLoading(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await axios.put('/api/users/preferences', preferences);
      
      // Update theme if changed
      if (preferences.theme !== mode) {
        toggleTheme();
      }
      
      setSuccess('Preferences saved successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
      setLoading(false);
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError(err.response?.data?.message || 'Failed to save preferences');
      setLoading(false);
    }
  };

  const handleAddApiKey = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await axios.post('/api/users/apikeys', newApiKey);
      
      fetchApiKeys();
      handleAddKeyDialogClose();
      setSuccess('API key added successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
      setLoading(false);
    } catch (err) {
      console.error('Error adding API key:', err);
      setError(err.response?.data?.message || 'Failed to add API key');
      setLoading(false);
    }
  };

  const handleDeleteApiKey = async (keyId) => {
    try {
      setLoading(true);
      
      await axios.delete(`/api/users/apikeys/${keyId}`);
      
      fetchApiKeys();
      setSuccess('API key deleted successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
      setLoading(false);
    } catch (err) {
      console.error('Error deleting API key:', err);
      setError(err.response?.data?.message || 'Failed to delete API key');
      setLoading(false);
    }
  };

  // Get provider display name
  const getProviderName = (provider) => {
    switch (provider) {
      case 'openai': return 'OpenAI';
      case 'anthropic': return 'Anthropic';
      case 'together': return 'Together AI';
      default: return provider;
    }
  };

  // Get provider color
  const getProviderColor = (provider) => {
    switch (provider) {
      case 'openai': return 'primary';
      case 'anthropic': return 'secondary';
      case 'together': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

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
          <Tab label="Profile" />
          <Tab label="API Keys" />
          <Tab label="Preferences" />
          <Tab label="CI Settings" icon={<PsychologyIcon />} iconPosition="start" />
        </Tabs>

        {/* Profile Tab */}
        {tabValue === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              User Profile
            </Typography>
            
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={profileData.name}
              onChange={handleProfileChange}
              margin="normal"
            />
            
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={profileData.email}
              disabled
              margin="normal"
            />
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              Change Password
            </Typography>
            
            <TextField
              fullWidth
              label="Current Password"
              name="currentPassword"
              type={showPassword ? 'text' : 'password'}
              value={profileData.currentPassword}
              onChange={handleProfileChange}
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              fullWidth
              label="New Password"
              name="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              value={profileData.newPassword}
              onChange={handleProfileChange}
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              fullWidth
              label="Confirm New Password"
              name="confirmPassword"
              type={showNewPassword ? 'text' : 'password'}
              value={profileData.confirmPassword}
              onChange={handleProfileChange}
              margin="normal"
            />
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSaveProfile}
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
          </Box>
        )}

        {/* API Keys Tab */}
        {tabValue === 1 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                API Keys
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddKeyDialogOpen}
              >
                Add API Key
              </Button>
            </Box>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : apiKeys.length > 0 ? (
              <Grid container spacing={2}>
                {apiKeys.map((key) => (
                  <Grid item xs={12} md={6} key={key._id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6">{key.name}</Typography>
                          <Chip 
                            label={getProviderName(key.provider)} 
                            color={getProviderColor(key.provider)} 
                            size="small" 
                            variant="outlined" 
                          />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <KeyIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {key.key.substring(0, 3)}•••••••••••••{key.key.substring(key.key.length - 4)}
                          </Typography>
                        </Box>
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small" 
                          color="error" 
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDeleteApiKey(key._id)}
                        >
                          Remove
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary" paragraph>
                  No API keys added yet. Add your first API key to use with custom agents.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleAddKeyDialogOpen}
                >
                  Add API Key
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* Preferences Tab */}
        {tabValue === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Application Preferences
            </Typography>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Default Model</InputLabel>
              <Select
                name="defaultModel"
                value={preferences.defaultModel}
                onChange={handlePreferenceChange}
                label="Default Model"
              >
                <MenuItem value="gpt-3.5-turbo">GPT-3.5 Turbo</MenuItem>
                <MenuItem value="gpt-4">GPT-4</MenuItem>
                <MenuItem value="claude-2">Claude 2</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Theme</InputLabel>
              <Select
                name="theme"
                value={preferences.theme}
                onChange={handlePreferenceChange}
                label="Theme"
              >
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="dark">Dark</MenuItem>
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.notifications}
                  onChange={handleSwitchChange}
                  name="notifications"
                  color="primary"
                />
              }
              label="Enable Notifications"
              sx={{ mt: 2 }}
            />
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSavePreferences}
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Save Preferences'}
            </Button>
          </Box>
        )}
        
        {/* CI Settings Tab */}
        {tabValue === 3 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Cognitive Intelligence Settings
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Configure CI model preferences, ethical alignment, and context bridge settings.
            </Typography>
            
            <CIModelSettings 
              onSave={(settings) => {
                setSuccess('CI settings saved successfully');
                setTimeout(() => setSuccess(null), 3000);
              }} 
            />
          </Box>
        )}
      </Paper>

      {/* Add API Key Dialog */}
      <Dialog open={addKeyDialogOpen} onClose={handleAddKeyDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add API Key</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Key Name"
            fullWidth
            value={newApiKey.name}
            onChange={handleNewApiKeyChange}
          />
          
          <FormControl fullWidth margin="dense">
            <InputLabel>Provider</InputLabel>
            <Select
              name="provider"
              value={newApiKey.provider}
              onChange={handleNewApiKeyChange}
              label="Provider"
            >
              <MenuItem value="openai">OpenAI</MenuItem>
              <MenuItem value="anthropic">Anthropic</MenuItem>
              <MenuItem value="together">Together AI</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            margin="dense"
            name="key"
            label="API Key"
            fullWidth
            value={newApiKey.key}
            onChange={handleNewApiKeyChange}
            type={showPassword ? 'text' : 'password'}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddKeyDialogClose}>Cancel</Button>
          <Button 
            onClick={handleAddApiKey} 
            color="primary"
            disabled={!newApiKey.name || !newApiKey.key}
          >
            Add Key
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;