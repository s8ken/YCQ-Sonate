"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  Radio,
  RadioGroup,
  Switch,
  Typography,
  useTheme,
} from "@mui/material"
import SaveIcon from "@mui/icons-material/Save"
import axios from "axios"
import "../../styles/builder.css"

const CIModelSettings = ({ onSave }) => {
  const theme = useTheme()
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    ciEnabled: false,
    preferredModel: "symbi-core",
    ethicalAlignment: true,
    contextBridgeEnabled: false,
    modelPriority: "balanced",
  })
  const [availableModels, setAvailableModels] = useState([
    {
      id: "symbi-core",
      name: "Symbi Core",
      description: "Open-source CI model optimized for ethical alignment",
      cost: "Low",
      provider: "Symbi",
    },
    {
      id: "overseer-lite",
      name: "Overseer Lite",
      description: "Lightweight CI model with basic ethical guardrails",
      cost: "Free",
      provider: "Overseer",
    },
    {
      id: "overseer-pro",
      name: "Overseer Pro",
      description: "Advanced CI model with enhanced context awareness",
      cost: "Medium",
      provider: "Overseer",
    },
    {
      id: "custom",
      name: "Custom CI Model",
      description: "Connect your own CI model implementation",
      cost: "Varies",
      provider: "Custom",
    },
  ])

  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true)
      try {
        const response = await axios.get("/api/settings/ci")
        if (response.data) {
          setSettings(response.data)
        }
      } catch (error) {
        console.error("Error fetching CI settings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  // Handle settings changes
  const handleChange = (event) => {
    const { name, value, checked } = event.target
    const newValue = event.target.type === "checkbox" ? checked : value

    setSettings((prev) => ({
      ...prev,
      [name]: newValue,
    }))
  }

  // Save settings
  const saveSettings = async () => {
    setLoading(true)
    try {
      await axios.put("/api/settings/ci", settings)
      if (onSave) onSave(settings)
    } catch (error) {
      console.error("Error saving CI settings:", error)
    } finally {
      setLoading(false)
    }
  }

  // Auto-save when settings change
  useEffect(() => {
    const timer = setTimeout(() => {
      saveSettings()
    }, 1000)

    return () => clearTimeout(timer)
  }, [settings])

  return (
    <Card
      sx={{
        mb: 3,
        borderRadius: 3,
        background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
      }}
    >
      <CardHeader
        title="Cognitive Intelligence Settings"
        subheader="Configure CI model preferences and ethical alignment"
        sx={{
          "& .MuiCardHeader-title": {
            fontWeight: 600,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          },
        }}
      />
      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />
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
                    sx={{
                      "& .MuiSwitch-switchBase": {
                        "&.Mui-checked": {
                          color: "#667eea",
                          "& + .MuiSwitch-track": {
                            backgroundColor: "#667eea",
                            opacity: 0.5,
                          },
                        },
                      },
                      "& .MuiSwitch-track": {
                        borderRadius: 12,
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                      },
                      "& .MuiSwitch-thumb": {
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                      },
                    }}
                  />
                }
                label="Enable Cognitive Intelligence"
                sx={{
                  "& .MuiFormControlLabel-label": {
                    fontWeight: 500,
                  },
                }}
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
                  <RadioGroup name="preferredModel" value={settings.preferredModel} onChange={handleChange}>
                    {availableModels.map((model) => (
                      <Box
                        key={model.id}
                        className={`provider-card ${settings.preferredModel === model.id ? "selected" : ""}`}
                        sx={{
                          mb: 2,
                          p: 2,
                          borderRadius: 2,
                          border: `1px solid ${theme.palette.divider}`,
                          "&.selected": {
                            borderColor: theme.palette.primary.main,
                            backgroundColor:
                              theme.palette.mode === "dark" ? "rgba(25, 118, 210, 0.12)" : "rgba(25, 118, 210, 0.08)",
                          },
                        }}
                      >
                        <FormControlLabel
                          value={model.id}
                          control={
                            <Radio
                              sx={{
                                color: "rgba(255, 255, 255, 0.7)",
                                "&.Mui-checked": {
                                  color: "#667eea",
                                },
                                "& .MuiSvgIcon-root": {
                                  fontSize: 20,
                                },
                              }}
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {model.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {model.description}
                              </Typography>
                              <Box sx={{ display: "flex", mt: 1 }}>
                                <Typography variant="caption" sx={{ mr: 2, fontWeight: 500 }}>
                                  Provider: {model.provider}
                                </Typography>
                                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                  Cost: {model.cost}
                                </Typography>
                              </Box>
                            </Box>
                          }
                          sx={{ width: "100%", m: 0 }}
                        />
                      </Box>
                    ))}
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl component="fieldset" variant="standard">
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      color: "#667eea",
                      mb: 1,
                    }}
                  >
                    CI Model Priority
                  </Typography>
                  <RadioGroup
                    aria-labelledby="ci-model-priority-label"
                    value={settings.modelPriority}
                    onChange={handleChange}
                    name="modelPriority"
                  >
                    <FormControlLabel
                      value="performance"
                      control={
                        <Radio
                          sx={{
                            color: "rgba(255, 255, 255, 0.7)",
                            "&.Mui-checked": {
                              color: "#667eea",
                            },
                            "& .MuiSvgIcon-root": {
                              fontSize: 20,
                            },
                          }}
                        />
                      }
                      label="Performance"
                      sx={{
                        "& .MuiFormControlLabel-label": {
                          fontWeight: 500,
                        },
                      }}
                    />
                    <FormControlLabel
                      value="balanced"
                      control={
                        <Radio
                          sx={{
                            color: "rgba(255, 255, 255, 0.7)",
                            "&.Mui-checked": {
                              color: "#667eea",
                            },
                            "& .MuiSvgIcon-root": {
                              fontSize: 20,
                            },
                          }}
                        />
                      }
                      label="Balanced"
                      sx={{
                        "& .MuiFormControlLabel-label": {
                          fontWeight: 500,
                        },
                      }}
                    />
                    <FormControlLabel
                      value="efficiency"
                      control={
                        <Radio
                          sx={{
                            color: "rgba(255, 255, 255, 0.7)",
                            "&.Mui-checked": {
                              color: "#667eea",
                            },
                            "& .MuiSvgIcon-root": {
                              fontSize: 20,
                            },
                          }}
                        />
                      }
                      label="Efficiency"
                      sx={{
                        "& .MuiFormControlLabel-label": {
                          fontWeight: 500,
                        },
                      }}
                    />
                  </RadioGroup>
                  <FormHelperText>Choose the optimization focus for CI model selection</FormHelperText>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Advanced Settings
                </Typography>
                <FormControl component="fieldset" variant="standard" sx={{ display: "block", mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.ethicalAlignment}
                        onChange={handleChange}
                        name="ethicalAlignment"
                        sx={{
                          "& .MuiSwitch-switchBase": {
                            "&.Mui-checked": {
                              color: "#667eea",
                              "& + .MuiSwitch-track": {
                                backgroundColor: "#667eea",
                                opacity: 0.5,
                              },
                            },
                          },
                          "& .MuiSwitch-track": {
                            borderRadius: 12,
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                          },
                          "& .MuiSwitch-thumb": {
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                          },
                        }}
                      />
                    }
                    label="Enable Ethical Alignment"
                    sx={{
                      "& .MuiFormControlLabel-label": {
                        fontWeight: 500,
                      },
                    }}
                  />
                  <FormHelperText>Ensure AI responses adhere to ethical guidelines and values</FormHelperText>
                </FormControl>

                <FormControl component="fieldset" variant="standard">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.contextBridgeEnabled}
                        onChange={handleChange}
                        name="contextBridgeEnabled"
                        sx={{
                          "& .MuiSwitch-switchBase": {
                            "&.Mui-checked": {
                              color: "#667eea",
                              "& + .MuiSwitch-track": {
                                backgroundColor: "#667eea",
                                opacity: 0.5,
                              },
                            },
                          },
                          "& .MuiSwitch-track": {
                            borderRadius: 12,
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                          },
                          "& .MuiSwitch-thumb": {
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                          },
                        }}
                      />
                    }
                    label="Enable Context Bridge"
                    sx={{
                      "& .MuiFormControlLabel-label": {
                        fontWeight: 500,
                      },
                    }}
                  />
                  <FormHelperText>Allow secure context sharing between Symbi and Overseer systems</FormHelperText>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                  <Button
                    variant="contained"
                    onClick={saveSettings}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} sx={{ color: "white" }} /> : <SaveIcon />}
                    sx={{
                      background: loading
                        ? "linear-gradient(135deg, rgba(102, 126, 234, 0.6) 0%, rgba(118, 75, 162, 0.6) 100%)"
                        : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      textTransform: "none",
                      fontSize: "1rem",
                      boxShadow: "0 8px 32px rgba(102, 126, 234, 0.3)",
                      border: "none",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        background: loading
                          ? "linear-gradient(135deg, rgba(102, 126, 234, 0.6) 0%, rgba(118, 75, 162, 0.6) 100%)"
                          : "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
                        boxShadow: "0 12px 40px rgba(102, 126, 234, 0.4)",
                        transform: "translateY(-2px)",
                      },
                      "&:active": {
                        transform: "translateY(0px)",
                        boxShadow: "0 4px 16px rgba(102, 126, 234, 0.3)",
                      },
                      "&.Mui-disabled": {
                        background:
                          "linear-gradient(135deg, rgba(102, 126, 234, 0.6) 0%, rgba(118, 75, 162, 0.6) 100%)",
                        color: "white",
                        boxShadow: "0 4px 16px rgba(102, 126, 234, 0.2)",
                      },
                    }}
                  >
                    {loading ? "Saving..." : "Save Settings"}
                  </Button>
                </Box>
              </Grid>
            </>
          )}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default CIModelSettings
