import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  Radio,
  RadioGroup,
  Switch,
  Typography,
  useTheme
} from '@mui/material';
import axios from 'axios';
import '../../styles/builder.css';

const CIModelSettings = ({ onSave }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    ciEnabled: false,
    preferredModel: 'symbi-core',
    ethicalAlignment: true,
    contextBridgeEnabled: false
  });
  const [availableModels, setAvailableModels] = useState([
    { id: 'symbi-core', name: 'Symbi Core', description: 'Open-source CI model optimized for ethical alignment', cost: 'Low', provider: 'Symbi' },
    { id: 'overseer-lite', name: 'Overseer Lite', description: 'Lightweight CI model with basic ethical guardrails', cost: 'Free', provider: 'Overseer' },
    { id: 'overseer-pro', name: 'Overseer Pro', description: 'Advanced CI model with enhanced context awareness', cost: 'Medium', provider: 'Overseer' },
    { id: 'custom', name: 'Custom CI Model', description: 'Connect your own CI model implementation', cost: 'Varies', provider: 'Custom' }
  ]);

  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/settings/ci');
        if (response.data) {
          setSettings(response.data);
        }
      } catch (error) {
        console.error('Error fetching CI settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Handle settings changes
  const handleChange = (event) => {
    const { name, value, checked } = event.target;
    const newValue = event.target.type === 'checkbox' ? checked : value;
    
    setSettings(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  // Save settings
  const saveSettings = async () => {
    setLoading(true);
    try {
      await axios.put('/api/settings/ci', settings);
      if (onSave) onSave(settings);
    } catch (error) {
      console.error('Error saving CI settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-save when settings change
  useEffect(() => {
    const timer = setTimeout(() => {
      saveSettings();
    }, 1000);

    return () => clearTimeout(timer);
  }, [settings]);

  return (
    <Card sx={{ mb: 3 }}>
      <CardHeader 
        title="Cognitive Intelligence Settings" 
        subheader="Configure CI model preferences and ethical alignment"
      />
      <Divider />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl component="fieldset" variant="standard">
              <FormControlLabel
                control={
                  <Switch 
                    checked={settings.ciEnabled} 
                    onChange={handleChange} 
                    name="ciEnabled" 
                  />
                }
                label="Enable Cognitive Intelligence"
              />
              <FormHelperText>
                Activate advanced cognitive capabilities for your agents and conversations
              </FormHelperText>
            </FormControl>
          </Grid>

          {settings.ciEnabled && (
            <>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Select Preferred CI Model
                </Typography>
                <FormControl component="fieldset">
                  <RadioGroup
                    name="preferredModel"
                    value={settings.preferredModel}
                    onChange={handleChange}
                  >
                    {availableModels.map(model => (
                      <Box 
                        key={model.id} 
                        className={`provider-card ${settings.preferredModel === model.id ? 'selected' : ''}`}
                        sx={{ 
                          mb: 2, 
                          p: 2, 
                          borderRadius: 2,
                          border: `1px solid ${theme.palette.divider}`,
                          '&.selected': {
                            borderColor: theme.palette.primary.main,
                            backgroundColor: theme.palette.mode === 'dark' 
                              ? 'rgba(25, 118, 210, 0.12)' 
                              : 'rgba(25, 118, 210, 0.08)'
                          }
                        }}
                      >
                        <FormControlLabel 
                          value={model.id} 
                          control={<Radio />} 
                          label={
                            <Box>
                              <Typography variant="subtitle2">
                                {model.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {model.description}
                              </Typography>
                              <Box sx={{ display: 'flex', mt: 1 }}>
                                <Typography variant="caption" sx={{ mr: 2 }}>
                                  Provider: {model.provider}
                                </Typography>
                                <Typography variant="caption">
                                  Cost: {model.cost}
                                </Typography>
                              </Box>
                            </Box>
                          }
                          sx={{ width: '100%', m: 0 }}
                        />
                      </Box>
                    ))}
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Advanced Settings
                </Typography>
                <FormControl component="fieldset" variant="standard" sx={{ display: 'block', mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={settings.ethicalAlignment} 
                        onChange={handleChange} 
                        name="ethicalAlignment" 
                      />
                    }
                    label="Enable Ethical Alignment"
                  />
                  <FormHelperText>
                    Ensure AI responses adhere to ethical guidelines and values
                  </FormHelperText>
                </FormControl>

                <FormControl component="fieldset" variant="standard">
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={settings.contextBridgeEnabled} 
                        onChange={handleChange} 
                        name="contextBridgeEnabled" 
                      />
                    }
                    label="Enable Context Bridge"
                  />
                  <FormHelperText>
                    Allow secure context sharing between Symbi and Overseer systems
                  </FormHelperText>
                </FormControl>
              </Grid>
            </>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default CIModelSettings;