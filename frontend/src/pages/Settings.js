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
import TrustModeInfo from '../components/common/TrustModeInfo';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import KeyIcon from '@mui/icons-material/Key';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { useAuth } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import axios from 'axios';
// POC: CI settings disabled; Trust Mode (heuristic) only
import '../styles/builder.css';

const Settings = () => {
  const { user, updateUser } = useAuth();
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
    defaultModel: 'gpt-4o',
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
      const res = await axios.get('/api/users/api-keys');
      setApiKeys(res.data.data || []);
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
      
      await axios.post('/api/users/api-keys', newApiKey);
      
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
      
      await axios.delete(`/api/users/api-keys/${keyId}`);
      
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
      case 'perplexity': return 'Perplexity';
      case 'v0': return 'v0 by Vercel';
      default: return provider;
    }
  };

  // Get provider color
  const getProviderColor = (provider) => {
    switch (provider) {
      case 'openai': return 'primary';
      case 'anthropic': return 'secondary';
      case 'together': return 'success';
      case 'perplexity': return 'info';
      case 'v0': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
      <Typography 
        variant="h4" 
        gutterBottom
        sx={{
          fontWeight: 700,
          color: 'text.primary',
          mb: 3
        }}
      >
        Settings
      </Typography>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: 2,
            border: '1px solid #f87171',
            backgroundColor: '#fef2f2'
          }}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: 3,
            borderRadius: 2,
            border: '1px solid #10b981',
            backgroundColor: '#f0fdf4'
          }}
        >
          {success}
        </Alert>
      )}

      <Paper 
        sx={{ 
          p: 4, 
          mb: 3,
          borderRadius: 3,
          backgroundColor: 'background.paper',
          border: (theme) => `1px solid ${theme.palette.divider}`,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          sx={{ 
            mb: 4,
            '& .MuiTabs-indicator': {
              backgroundColor: 'primary.main',
              height: 3,
              borderRadius: '3px 3px 0 0'
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              color: 'text.secondary',
              '&.Mui-selected': {
                color: 'primary.main'
              },
              '&:hover': {
                color: 'primary.main',
                backgroundColor: 'rgba(102, 126, 234, 0.05)'
              }
            }
          }}
        >
          <Tab label="Profile" />
          <Tab label="API Keys" />
          <Tab label="Preferences" />
          <Tab 
            label="Trust Mode" 
            icon={<PsychologyIcon sx={{ color: 'primary.main' }} />} 
            iconPosition="start" 
          />
        </Tabs>

        {/* Profile Tab */}
        {tabValue === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              User Profile
            </Typography>
            
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={profileData.name}
              onChange={handleProfileChange}
              margin="normal"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'background.paper',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 0 0 1px rgba(102, 126, 234, 0.2)'
                  },
                  '&.Mui-focused': {
                    borderColor: 'primary.main',
                    boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                  }
                },
                '& .MuiInputLabel-root': {
                  color: 'text.secondary',
                  '&.Mui-focused': {
                    color: 'primary.main'
                  }
                }
              }}
            />
            
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={profileData.email}
              onChange={handleProfileChange}
              margin="normal"
              disabled
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'action.hover',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  '&.Mui-disabled': {
                    backgroundColor: 'action.disabledBackground',
                    color: 'text.disabled'
                  }
                },
                '& .MuiInputLabel-root': {
                  color: 'text.disabled'
                }
              }}
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
                      sx={{
                        color: 'text.secondary',
                        '&:hover': {
                          color: 'primary.main',
                          backgroundColor: 'rgba(102, 126, 234, 0.1)'
                        }
                      }}
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'background.paper',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 0 0 1px rgba(102, 126, 234, 0.2)'
                  },
                  '&.Mui-focused': {
                    borderColor: 'primary.main',
                    boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                  }
                },
                '& .MuiInputLabel-root': {
                  color: 'text.secondary',
                  '&.Mui-focused': {
                    color: 'primary.main'
                  }
                }
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
                      sx={{
                        color: 'text.secondary',
                        '&:hover': {
                          color: 'primary.main',
                          backgroundColor: 'rgba(102, 126, 234, 0.1)'
                        }
                      }}
                    >
                      {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'background.paper',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 0 0 1px rgba(102, 126, 234, 0.2)'
                  },
                  '&.Mui-focused': {
                    borderColor: 'primary.main',
                    boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                  }
                },
                '& .MuiInputLabel-root': {
                  color: 'text.secondary',
                  '&.Mui-focused': {
                    color: 'primary.main'
                  }
                }
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'background.paper',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 0 0 1px rgba(102, 126, 234, 0.2)'
                  },
                  '&.Mui-focused': {
                    borderColor: 'primary.main',
                    boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                  }
                },
                '& .MuiInputLabel-root': {
                  color: 'text.secondary',
                  '&.Mui-focused': {
                    color: 'primary.main'
                  }
                }
              }}
            />
            
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveProfile}
              disabled={loading}
              sx={{ 
                mt: 4,
                py: 1.5,
                px: 4,
                borderRadius: 2,
                backgroundColor: 'primary.main',
                color: 'white',
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'none',
                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                },
                '&:disabled': {
                  backgroundColor: 'action.disabledBackground',
                  color: 'text.disabled'
                }
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} sx={{ color: 'white' }} />
                  <span>Saving...</span>
                </Box>
              ) : (
                'Save Changes'
              )}
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
                startIcon={<AddIcon />}
                onClick={handleAddKeyDialogOpen}
                sx={{
                  py: 1.2,
                  px: 3,
                  borderRadius: 2,
                  backgroundColor: 'primary.main',
                  color: 'white',
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: '0 2px 8px rgba(102, 126, 234, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                  },
                  '&:active': {
                    transform: 'translateY(0px)'
                  }
                }}
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
                    <Card 
                      variant="outlined"
                      sx={{
                        borderRadius: 2,
                        border: (theme) => `1px solid ${theme.palette.divider}`,
                        backgroundColor: 'background.paper',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                        '&:hover': {
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                        }
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6">{key.name || 'Unnamed Key'}</Typography>
                          <Chip 
                            label={getProviderName(key.provider || 'unknown')} 
                            color={getProviderColor(key.provider || 'unknown')} 
                            size="small" 
                            variant="outlined" 
                          />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <KeyIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {key.key ? `${key.key.substring(0, 3)}•••••••••••••${key.key.substring(key.key.length - 4)}` : '••••••••••••••••'}
                          </Typography>
                        </Box>
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small" 
                          color="error" 
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDeleteApiKey(key._id)}
                          sx={{
                            textTransform: 'none',
                            fontWeight: 500,
                            borderRadius: 1.5,
                            '&:hover': {
                              backgroundColor: 'error.light',
                              color: 'white'
                            }
                          }}
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
                  startIcon={<AddIcon />}
                  onClick={handleAddKeyDialogOpen}
                  sx={{
                    py: 1.5,
                    px: 4,
                    borderRadius: 2,
                    backgroundColor: 'primary.main',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '1rem',
                    textTransform: 'none',
                    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                    }
                  }}
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
                sx={{
                  borderRadius: 2,
                  backgroundColor: 'background.paper',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 0 0 1px rgba(102, 126, 234, 0.2)'
                  },
                  '&.Mui-focused': {
                    borderColor: 'primary.main',
                    boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                  },
                  '& .MuiInputLabel-root': {
                    color: 'text.secondary',
                    '&.Mui-focused': {
                      color: 'primary.main'
                    }
                  }
                }}
              >
                <MenuItem value="gpt-3.5-turbo">GPT-3.5 Turbo</MenuItem>
                <MenuItem value="gpt-4">GPT-4</MenuItem>
                <MenuItem value="gpt-4o">GPT-4o</MenuItem>
                <MenuItem value="gpt-4-turbo">GPT-4 Turbo</MenuItem>
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
                sx={{
                  borderRadius: 2,
                  backgroundColor: 'background.paper',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 0 0 1px rgba(102, 126, 234, 0.2)'
                  },
                  '&.Mui-focused': {
                    borderColor: 'primary.main',
                    boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                  },
                  '& .MuiInputLabel-root': {
                    color: 'text.secondary',
                    '&.Mui-focused': {
                      color: 'primary.main'
                    }
                  }
                }}
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
                  sx={{
                    '& .MuiSwitch-switchBase': {
                      '&.Mui-checked': {
                        color: 'primary.main',
                        '& + .MuiSwitch-track': {
                          backgroundColor: 'primary.main',
                          opacity: 0.6
                        }
                      }
                    },
                    '& .MuiSwitch-track': {
                      borderRadius: 12,
                      backgroundColor: 'action.disabled',
                      border: (theme) => `1px solid ${theme.palette.divider}`
                    },
                    '& .MuiSwitch-thumb': {
                      backgroundColor: 'background.paper',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
                    }
                  }}
                />
              }
              label="Enable Notifications"
              sx={{ 
                mt: 2,
                '& .MuiFormControlLabel-label': {
                  fontWeight: 500
                }
              }}
            />
            
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSavePreferences}
              disabled={loading}
              sx={{ 
                mt: 4,
                py: 1.5,
                px: 4,
                borderRadius: 2,
                backgroundColor: 'primary.main',
                color: 'white',
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'none',
                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                },
                '&:disabled': {
                  backgroundColor: 'action.disabledBackground',
                  color: 'text.disabled'
                }
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} sx={{ color: 'white' }} />
                  <span>Saving...</span>
                </Box>
              ) : (
                'Save Preferences'
              )}
            </Button>
          </Box>
        )}
        
        {/* Trust Mode Tab (POC: Heuristic only) */}
        {tabValue === 3 && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" gutterBottom sx={{ m: 0 }}>
                Trust Mode
              </Typography>
              <TrustModeInfo />
            </Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              POC uses lightweight, on‑server heuristics to compute trust overlays.
            </Typography>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2,
                borderRadius: 2,
                backgroundColor: 'background.paper',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Heuristic (local)</Typography>
              <Typography variant="body2" color="text.secondary">
                No external systems or governance layers are used in POC mode.
              </Typography>
            </Paper>
          </Box>
        )}
      </Paper>

      {/* Add API Key Dialog */}
      <Dialog 
        open={addKeyDialogOpen} 
        onClose={handleAddKeyDialogClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            backgroundColor: 'background.paper',
            border: (theme) => `1px solid ${theme.palette.divider}`,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 600, 
          fontSize: '1.5rem',
          color: 'text.primary',
          pb: 1
        }}>
          Add API Key
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Key Name"
            fullWidth
            value={newApiKey.name}
            onChange={handleNewApiKeyChange}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: 'background.paper',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  boxShadow: '0 0 0 1px rgba(102, 126, 234, 0.2)'
                },
                '&.Mui-focused': {
                  borderColor: 'primary.main',
                  boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                }
              },
              '& .MuiInputLabel-root': {
                color: 'text.secondary',
                '&.Mui-focused': {
                  color: 'primary.main'
                }
              }
            }}
          />
          
          <FormControl fullWidth margin="dense">
            <InputLabel>Provider</InputLabel>
            <Select
              name="provider"
              value={newApiKey.provider}
              onChange={handleNewApiKeyChange}
              label="Provider"
              sx={{
                borderRadius: 2,
                backgroundColor: 'background.paper',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  boxShadow: '0 0 0 1px rgba(102, 126, 234, 0.2)'
                },
                '&.Mui-focused': {
                  borderColor: 'primary.main',
                  boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                },
                '& .MuiInputLabel-root': {
                  color: 'text.secondary',
                  '&.Mui-focused': {
                    color: 'primary.main'
                  }
                }
              }}
            >
              <MenuItem value="openai">OpenAI</MenuItem>
              <MenuItem value="anthropic">Anthropic</MenuItem>
              <MenuItem value="together">Together AI</MenuItem>
              <MenuItem value="perplexity">Perplexity</MenuItem>
              <MenuItem value="v0">v0 by Vercel</MenuItem>
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
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: 'background.paper',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  boxShadow: '0 0 0 1px rgba(102, 126, 234, 0.2)'
                },
                '&.Mui-focused': {
                  borderColor: 'primary.main',
                  boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)'
                }
              },
              '& .MuiInputLabel-root': {
                color: 'text.secondary',
                '&.Mui-focused': {
                  color: 'primary.main'
                }
              }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'primary.main',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)'
                      }
                    }}
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={handleAddKeyDialogClose}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 2,
              color: 'text.secondary',
              border: (theme) => `1px solid ${theme.palette.divider}`,
              textTransform: 'none',
              fontWeight: 500,
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'action.hover',
                color: 'text.primary',
                borderColor: 'text.secondary'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddApiKey} 
            disabled={!newApiKey.name || !newApiKey.key}
            sx={{
              px: 4,
              py: 1,
              borderRadius: 2,
              backgroundColor: 'primary.main',
              color: 'white',
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 2px 8px rgba(102, 126, 234, 0.2)',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'primary.dark',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
              },
              '&:disabled': {
                backgroundColor: 'action.disabledBackground',
                color: 'text.disabled'
              }
            }}
          >
            Add Key
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;