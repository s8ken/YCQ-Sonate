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
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PsychologyIcon from '@mui/icons-material/Psychology';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MessageIcon from '@mui/icons-material/Message';
import GroupIcon from '@mui/icons-material/Group';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

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
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 4,
          p: 4,
          mb: 4,
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
            Welcome back, {user?.name || 'User'}! 👋
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
            Ready to continue your AI conversations and manage your agents?
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button 
              component={Link} 
              to="/conversations/new"
              variant="contained"
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                backdropFilter: 'blur(10px)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
              }}
              startIcon={<ChatIcon />}
            >
              New Conversation
            </Button>
            <Button 
              component={Link} 
              to="/agents/new"
              variant="outlined"
              sx={{ 
                borderColor: 'rgba(255,255,255,0.5)', 
                color: 'white',
                '&:hover': { 
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
              startIcon={<SmartToyIcon />}
            >
              Create Agent
            </Button>
          </Box>
        </Box>
        <Box 
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            zIndex: 0
          }}
        />
      </Box>
      
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <CardContent sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 600 }}>
                  Conversations
                </Typography>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                  <ChatIcon />
                </Avatar>
              </Box>
              <Typography variant="h2" sx={{ fontWeight: 700, mb: 1 }}>
                {stats.totalConversations}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ mr: 0.5, fontSize: 16 }} />
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Active discussions
                </Typography>
              </Box>
            </CardContent>
            <Box 
              sx={{
                position: 'absolute',
                top: -30,
                right: -30,
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)'
              }}
            />
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(240, 147, 251, 0.3)'
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <CardContent sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 600 }}>
                  AI Agents
                </Typography>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                  <SmartToyIcon />
                </Avatar>
              </Box>
              <Typography variant="h2" sx={{ fontWeight: 700, mb: 1 }}>
                {stats.totalAgents}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <GroupIcon sx={{ mr: 0.5, fontSize: 16 }} />
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Ready to assist
                </Typography>
              </Box>
            </CardContent>
            <Box 
              sx={{
                position: 'absolute',
                top: -30,
                right: -30,
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)'
              }}
            />
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(79, 172, 254, 0.3)'
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <CardContent sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 600 }}>
                  Messages
                </Typography>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                  <MessageIcon />
                </Avatar>
              </Box>
              <Typography variant="h2" sx={{ fontWeight: 700, mb: 1 }}>
                {stats.totalMessages}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ mr: 0.5, fontSize: 16 }} />
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Total exchanged
                </Typography>
              </Box>
            </CardContent>
            <Box 
              sx={{
                position: 'absolute',
                top: -30,
                right: -30,
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)'
              }}
            />
          </Card>
        </Grid>
        
        {/* Cognitive Intelligence Status */}
        <Grid item xs={12}>
          <Card 
            sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <CardHeader 
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PsychologyIcon sx={{ fontSize: 28 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
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
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      borderRadius: 3,
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ opacity: 0.9, mb: 1, fontWeight: 600 }}>
                      CI System
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                      Online
                    </Typography>
                    <Chip 
                      label="Active" 
                      size="small" 
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.2)', 
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
                        background: 'rgba(255,255,255,0.1)'
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
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      color: 'white',
                      borderRadius: 3,
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ opacity: 0.9, mb: 1, fontWeight: 600 }}>
                      Active Bridges
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                      3
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={75} 
                      sx={{ 
                        height: 6, 
                        borderRadius: 3,
                        bgcolor: 'rgba(255,255,255,0.2)',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: 'rgba(255,255,255,0.8)'
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
                        background: 'rgba(255,255,255,0.1)'
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
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: 'white',
                      borderRadius: 3,
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(245, 158, 11, 0.3)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ opacity: 0.9, mb: 1, fontWeight: 600 }}>
                      Avg Trust Score
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                      0.82
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={82} 
                      sx={{ 
                        height: 6, 
                        borderRadius: 3,
                        bgcolor: 'rgba(255,255,255,0.2)',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: 'rgba(255,255,255,0.8)'
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
                        background: 'rgba(255,255,255,0.1)'
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
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      color: 'white',
                      borderRadius: 3,
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ opacity: 0.9, mb: 1, fontWeight: 600 }}>
                      Bonded Agents
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                      2
                    </Typography>
                    <Chip 
                      label="Synchronized" 
                      size="small" 
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.2)', 
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
                        background: 'rgba(255,255,255,0.1)'
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
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid #e2e8f0'
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
                          border: '1px solid #f1f5f9',
                          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                            transform: 'translateX(4px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
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
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    borderRadius: 2,
                    border: '2px dashed #cbd5e1'
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
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid #e2e8f0'
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
                          border: '1px solid #f1f5f9',
                          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                          cursor: 'pointer',
                          '&:hover': { 
                            background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
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
