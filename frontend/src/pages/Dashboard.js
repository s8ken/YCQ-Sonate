import React, { useContext, useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader, 
  Button, 
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  CircularProgress,
  Avatar,
  Chip,
  LinearProgress
} from '@mui/material';
import { Link } from 'react-router-dom';
import ChatIcon from '@mui/icons-material/Chat';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AddIcon from '@mui/icons-material/Add';
import GroupsIcon from '@mui/icons-material/Groups';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PsychologyIcon from '@mui/icons-material/Psychology';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MessageIcon from '@mui/icons-material/Message';
import GroupIcon from '@mui/icons-material/Group';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import RoundtableDialog from '../components/bridge/RoundtableDialog';

const Dashboard = () => {
  const { user } = useAuth();
  const [recentConversations, setRecentConversations] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalConversations: 0,
    totalAgents: 0,
    totalMessages: 0
  });
  const [roundtableOpen, setRoundtableOpen] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch recent conversations
        const conversationsRes = await axios.get('/api/conversations?limit=5');
        setRecentConversations(conversationsRes.data.data || []);
        
        // Fetch agents
        const agentsRes = await axios.get('/api/agents?limit=4');
        setAgents(agentsRes.data.data || []);
        
        // Set stats
        const conversationsData = conversationsRes.data.data || [];
        const agentsData = agentsRes.data.data || [];
        setStats({
          totalConversations: conversationsRes.data.count || conversationsData.length,
          totalAgents: agentsRes.data.count || agentsData.length,
          totalMessages: conversationsData.reduce((acc, conv) => acc + (conv.messages?.length || 0), 0)
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setRecentConversations([]);
        setAgents([]);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
      {/* Welcome Header */}
      <Box 
        sx={{ 
          background: (theme) => theme.palette.background.paper,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          p: 4,
          mb: 4,
          color: (theme) => theme.palette.text.primary,
          boxShadow: (theme) => theme.palette.mode === 'dark' 
            ? '0 4px 20px rgba(0,0,0,0.3)' 
            : '0 4px 20px rgba(0,0,0,0.08)'
        }}
      >
          <Typography 
            variant="h3" 
            gutterBottom 
            sx={{ 
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: (theme) => theme.palette.text.primary
            }}
          >
            Welcome back, {user?.name || 'User'}!
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 400,
              mb: 3,
              color: (theme) => theme.palette.text.secondary
            }}
          >
            Ready to continue your AI conversations?
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button 
              component={Link} 
              to="/conversations/new"
              variant="contained"
              sx={{ 
                bgcolor: (theme) => theme.palette.primary.main,
                color: (theme) => theme.palette.primary.contrastText,
                borderRadius: 2,
                fontWeight: 600,
                textTransform: 'none',
                px: 3,
                py: 1.5,
                '&:hover': { 
                  bgcolor: (theme) => theme.palette.primary.dark,
                  transform: 'translateY(-1px)',
                  boxShadow: (theme) => theme.palette.mode === 'dark' 
                    ? '0 8px 25px rgba(0,0,0,0.4)' 
                    : '0 8px 25px rgba(0,0,0,0.15)'
                },
                transition: 'all 0.2s ease'
              }}
              startIcon={<ChatIcon sx={{ color: (theme) => theme.palette.info.main }} />}
            >
              New Conversation
            </Button>
            <Button 
              component={Link} 
              to="/agents/new"
              variant="contained"
              sx={{ 
                bgcolor: (theme) => theme.palette.primary.main,
                color: (theme) => theme.palette.primary.contrastText,
                borderRadius: 2,
                fontWeight: 600,
                textTransform: 'none',
                px: 3,
                py: 1.5,
                '&:hover': { 
                  bgcolor: (theme) => theme.palette.primary.dark,
                  transform: 'translateY(-1px)',
                  boxShadow: (theme) => theme.palette.mode === 'dark' 
                    ? '0 8px 25px rgba(0,0,0,0.4)' 
                    : '0 8px 25px rgba(0,0,0,0.15)'
                },
                transition: 'all 0.2s ease'
              }}
              startIcon={<SmartToyIcon sx={{ color: (theme) => theme.palette.success.main }} />}
            >
              Create Agent
            </Button>
            <Button
              variant="contained"
              onClick={() => setRoundtableOpen(true)}
              sx={{
                bgcolor: (theme) => theme.palette.primary.main,
                color: (theme) => theme.palette.primary.contrastText,
                borderRadius: 2,
                fontWeight: 600,
                textTransform: 'none',
                px: 3,
                py: 1.5,
                '&:hover': { 
                  bgcolor: (theme) => theme.palette.primary.dark,
                  transform: 'translateY(-1px)',
                  boxShadow: (theme) => theme.palette.mode === 'dark' 
                    ? '0 8px 25px rgba(0,0,0,0.4)' 
                    : '0 8px 25px rgba(0,0,0,0.15)'
                },
                transition: 'all 0.2s ease'
              }}
              startIcon={<GroupsIcon sx={{ color: (theme) => theme.palette.warning.main }} />}
            >
              Roundtable
            </Button>
          </Box>
        </Box>
        
        <RoundtableDialog open={roundtableOpen} onClose={() => setRoundtableOpen(false)} />
        
        <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              background: (theme) => theme.palette.background.paper,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: (theme) => theme.palette.mode === 'dark' 
                  ? '0 8px 25px rgba(0,0,0,0.3)' 
                  : '0 8px 25px rgba(0,0,0,0.1)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600,
                    color: (theme) => theme.palette.text.primary
                  }}
                >
                  Conversations
                </Typography>
                <Avatar sx={{ 
                  bgcolor: (theme) => theme.palette.background.default,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  width: 48, 
                  height: 48
                }}>
                  <ChatIcon sx={{ color: (theme) => theme.palette.info.main }} />
                </Avatar>
              </Box>
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 1,
                  color: (theme) => theme.palette.text.primary
                }}
              >
                {stats.totalConversations}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ mr: 0.5, fontSize: 16, color: (theme) => theme.palette.success.main }} />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontWeight: 500,
                    color: (theme) => theme.palette.text.secondary
                  }}
                >
                  Active discussions
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              background: (theme) => theme.palette.background.paper,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: (theme) => theme.palette.mode === 'dark' 
                  ? '0 8px 25px rgba(0,0,0,0.3)' 
                  : '0 8px 25px rgba(0,0,0,0.1)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600,
                    color: (theme) => theme.palette.text.primary
                  }}
                >
                  AI Agents
                </Typography>
                <Avatar sx={{ 
                  bgcolor: (theme) => theme.palette.background.default,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  width: 48, 
                  height: 48
                }}>
                  <SmartToyIcon sx={{ color: (theme) => theme.palette.success.main }} />
                </Avatar>
              </Box>
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 1,
                  color: (theme) => theme.palette.text.primary
                }}
              >
                {stats.totalAgents}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ mr: 0.5, fontSize: 16, color: (theme) => theme.palette.success.main }} />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontWeight: 500,
                    color: (theme) => theme.palette.text.secondary
                  }}
                >
                  Ready to assist
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              background: (theme) => theme.palette.background.paper,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: (theme) => theme.palette.mode === 'dark' 
                  ? '0 8px 25px rgba(0,0,0,0.3)' 
                  : '0 8px 25px rgba(0,0,0,0.1)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600,
                    color: (theme) => theme.palette.text.primary
                  }}
                >
                  Messages
                </Typography>
                <Avatar sx={{ 
                  bgcolor: (theme) => theme.palette.background.default,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  width: 48, 
                  height: 48
                }}>
                  <MessageIcon sx={{ color: (theme) => theme.palette.warning.main }} />
                </Avatar>
              </Box>
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 1,
                  color: (theme) => theme.palette.text.primary
                }}
              >
                {stats.totalMessages}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ mr: 0.5, fontSize: 16, color: (theme) => theme.palette.success.main }} />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontWeight: 500,
                    color: (theme) => theme.palette.text.secondary
                  }}
                >
                  Total exchanged
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Cognitive Intelligence Status */}
        <Grid item xs={12}>
          <Card 
            sx={{ 
              backgroundColor: 'background.paper',
              border: (theme) => `1px solid ${theme.palette.divider}`,
              borderRadius: 3,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <CardHeader 
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PsychologyIcon sx={{ fontSize: 28, color: 'primary.main' }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    Cognitive Intelligence Status
                  </Typography>
                </Box>
              }
              sx={{ pb: 1 }}
            />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 3, 
                      textAlign: 'center', 
                      backgroundColor: 'background.paper',
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                      borderRadius: 3,
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 1, fontWeight: 600 }}>
                      CI System
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: 'success.main' }}>
                      Online
                    </Typography>
                    <Chip 
                      label="Active" 
                      size="small" 
                      sx={{ 
                        bgcolor: 'success.main', 
                        color: 'white',
                        fontWeight: 600
                      }} 
                    />
                    <Box 
                      sx={{
                        position: 'absolute',
                        top: -20,
                        right: -20,
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: 'rgba(16, 185, 129, 0.1)'
                      }}
                    />
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 3, 
                      textAlign: 'center', 
                      backgroundColor: 'background.paper',
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                      borderRadius: 3,
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 1, fontWeight: 600 }}>
                      Active Bridges
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: 'info.main' }}>
                      3
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={75} 
                      sx={{ 
                        height: 6, 
                        borderRadius: 3,
                        bgcolor: 'action.hover',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: 'info.main'
                        }
                      }} 
                    />
                    <Box 
                      sx={{
                        position: 'absolute',
                        top: -20,
                        right: -20,
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: 'rgba(14, 165, 233, 0.1)'
                      }}
                    />
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 3, 
                      textAlign: 'center', 
                      backgroundColor: 'background.paper',
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                      borderRadius: 3,
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 1, fontWeight: 600 }}>
                      Avg Trust Score
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: 'warning.main' }}>
                      0.82
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={82} 
                      sx={{ 
                        height: 6, 
                        borderRadius: 3,
                        bgcolor: 'action.hover',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: 'warning.main'
                        }
                      }} 
                    />
                    <Box 
                      sx={{
                        position: 'absolute',
                        top: -20,
                        right: -20,
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: 'rgba(245, 158, 11, 0.1)'
                      }}
                    />
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 3, 
                      textAlign: 'center', 
                      backgroundColor: 'background.paper',
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                      borderRadius: 3,
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 1, fontWeight: 600 }}>
                      Bonded Agents
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
                      2
                    </Typography>
                    <Chip 
                      label="Synchronized" 
                      size="small" 
                      sx={{ 
                        bgcolor: 'primary.main', 
                        color: 'white',
                        fontWeight: 600
                      }} 
                    />
                    <Box 
                      sx={{
                        position: 'absolute',
                        top: -20,
                        right: -20,
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: 'rgba(26, 26, 26, 0.1)'
                      }}
                    />
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
            <Box 
              sx={{
                position: 'absolute',
                top: -100,
                right: -100,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)'
              }}
            />
          </Card>
        </Grid>
        
        {/* Recent Conversations */}
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              height: '100%',
              borderRadius: 3,
              boxShadow: (theme) => theme.palette.mode === 'dark' 
                ? '0 4px 20px rgba(0,0,0,0.3)' 
                : '0 4px 20px rgba(0,0,0,0.08)',
              border: (theme) => `1px solid ${theme.palette.divider}`
            }}
          >
            <CardHeader 
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MessageIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    Recent Conversations
                  </Typography>
                </Box>
              }
              action={
                <Button 
                  component={Link} 
                  to="/conversations/new"
                  startIcon={<AddIcon />}
                  color="primary"
                  variant="contained"
                  size="small"
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  New
                </Button>
              }
              sx={{ pb: 1 }}
            />
            <Divider />
            <CardContent sx={{ pt: 2 }}>
              {recentConversations.length > 0 ? (
                <List sx={{ p: 0 }}>
                  {recentConversations.map((conversation, index) => (
                    <React.Fragment key={conversation._id}>
                      <ListItem 
                        button 
                        component={Link} 
                        to={`/conversations/${conversation._id}`}
                        sx={{
                          borderRadius: 2,
                          mb: 1,
                          border: (theme) => `1px solid ${theme.palette.divider}`,
                          backgroundColor: 'background.paper',
                          '&:hover': {
                            backgroundColor: 'action.hover',
                            transform: 'translateX(4px)',
                            boxShadow: (theme) => theme.palette.mode === 'dark' 
                              ? '0 4px 12px rgba(0,0,0,0.4)' 
                              : '0 4px 12px rgba(0,0,0,0.1)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <Avatar 
                          sx={{ 
                            mr: 2, 
                            bgcolor: 'primary.main',
                            width: 40,
                            height: 40
                          }}
                        >
                          <ChatIcon sx={{ fontSize: 20 }} />
                        </Avatar>
                        <ListItemText 
                          primary={
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                              {conversation.title || 'Untitled Conversation'}
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(conversation.lastActivity || conversation.createdAt)}
                              </Typography>
                            </Box>
                          }
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TrendingUpIcon sx={{ color: 'success.main', fontSize: 20 }} />
                        </Box>
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box 
                  sx={{ 
                    textAlign: 'center', 
                    py: 6,
                    backgroundColor: 'action.hover',
                    borderRadius: 2,
                    border: (theme) => `2px dashed ${theme.palette.divider}`
                  }}
                >
                  <MessageIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                    No conversations yet
                  </Typography>
                  <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
                    Start a new conversation to see it here
                  </Typography>
                  <Button 
                    component={Link} 
                    to="/conversations/new"
                    startIcon={<AddIcon />}
                    color="primary"
                    variant="contained"
                    sx={{ 
                      mt: 2,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 3
                    }}
                  >
                    Start a New Conversation
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Your Agents */}
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              height: '100%',
              borderRadius: 3,
              boxShadow: (theme) => theme.palette.mode === 'dark' 
                ? '0 4px 20px rgba(0,0,0,0.3)' 
                : '0 4px 20px rgba(0,0,0,0.08)',
              border: (theme) => `1px solid ${theme.palette.divider}`
            }}
          >
            <CardHeader 
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SmartToyIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    Your Agents
                  </Typography>
                </Box>
              }
              action={
                <Button 
                  component={Link} 
                  to="/agents/new"
                  startIcon={<AddIcon />}
                  color="primary"
                  variant="contained"
                  size="small"
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  New
                </Button>
              }
              sx={{ pb: 1 }}
            />
            <Divider />
            <CardContent sx={{ pt: 2 }}>
              {agents.length > 0 ? (
                <Grid container spacing={2}>
                  {agents.map((agent) => (
                    <Grid item xs={12} sm={6} key={agent._id}>
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 3, 
                          display: 'flex', 
                          flexDirection: 'column',
                          height: '100%',
                          borderRadius: 3,
                          border: (theme) => `1px solid ${theme.palette.divider}`,
                          backgroundColor: 'background.paper',
                          cursor: 'pointer',
                          '&:hover': { 
                            backgroundColor: 'action.hover',
                            transform: 'translateY(-2px)',
                            boxShadow: (theme) => theme.palette.mode === 'dark' 
                              ? '0 8px 25px rgba(0,0,0,0.4)' 
                              : '0 8px 25px rgba(0,0,0,0.1)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                        component={Link}
                        to={`/agents/${agent._id}`}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar 
                            sx={{ 
                              mr: 2, 
                              bgcolor: 'primary.main',
                              width: 40,
                              height: 40
                            }}
                          >
                            <SmartToyIcon sx={{ fontSize: 20 }} />
                          </Avatar>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }} noWrap>
                            {agent.name}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          mb: 2,
                          flexGrow: 1
                        }}>
                          {agent.description || 'No description'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
                          <Chip 
                            label={agent.model || 'Default'} 
                            size="small" 
                            sx={{ 
                              bgcolor: 'primary.light',
                              color: 'primary.contrastText',
                              fontWeight: 600,
                              fontSize: '0.75rem'
                            }} 
                          />
                          <TrendingUpIcon sx={{ color: 'success.main', fontSize: 18 }} />
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box 
                  sx={{ 
                    textAlign: 'center', 
                    py: 6,
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    borderRadius: 2,
                    border: '2px dashed #cbd5e1'
                  }}
                >
                  <SmartToyIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                    No agents created yet
                  </Typography>
                  <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
                    Create your first AI agent to get started
                  </Typography>
                  <Button 
                    component={Link} 
                    to="/agents/new"
                    startIcon={<AddIcon />}
                    color="primary"
                    variant="contained"
                    sx={{ 
                      mt: 2,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 3
                    }}
                  >
                    Create Your First Agent
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
