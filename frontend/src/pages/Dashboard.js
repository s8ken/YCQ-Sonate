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
  CircularProgress
} from '@mui/material';
import { Link } from 'react-router-dom';
import ChatIcon from '@mui/icons-material/Chat';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AddIcon from '@mui/icons-material/Add';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
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
        setRecentConversations(conversationsRes.data);
        
        // Fetch agents
        const agentsRes = await axios.get('/api/agents?limit=4');
        setAgents(agentsRes.data);
        
        // Set stats
        setStats({
          totalConversations: conversationsRes.data.total || conversationsRes.data.length,
          totalAgents: agentsRes.data.total || agentsRes.data.length,
          totalMessages: conversationsRes.data.reduce((acc, conv) => acc + (conv.messages?.length || 0), 0)
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
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
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {user?.name || 'User'}!
      </Typography>
      
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Conversations
              </Typography>
              <Typography variant="h3">
                {stats.totalConversations}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Agents
              </Typography>
              <Typography variant="h3">
                {stats.totalAgents}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Messages
              </Typography>
              <Typography variant="h3">
                {stats.totalMessages}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Cognitive Intelligence Status */}
        <Grid item xs={12} md={12}>
          <Card>
            <CardHeader title="Cognitive Intelligence Status" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
                    <Typography variant="h6">CI System</Typography>
                    <Typography variant="h4">Online</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', color: 'white' }}>
                    <Typography variant="h6">Active Bridges</Typography>
                    <Typography variant="h4">3</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'white' }}>
                    <Typography variant="h6">Avg Trust Score</Typography>
                    <Typography variant="h4">0.82</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}>
                    <Typography variant="h6">Bonded Agents</Typography>
                    <Typography variant="h4">2</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Recent Conversations */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader 
              title="Recent Conversations" 
              action={
                <Button 
                  component={Link} 
                  to="/conversations/new"
                  startIcon={<AddIcon />}
                  color="primary"
                  variant="contained"
                  size="small"
                >
                  New
                </Button>
              }
            />
            <Divider />
            <CardContent>
              {recentConversations.length > 0 ? (
                <List>
                  {recentConversations.map((conversation) => (
                    <React.Fragment key={conversation._id}>
                      <ListItem 
                        button 
                        component={Link} 
                        to={`/conversations/${conversation._id}`}
                      >
                        <ListItemIcon>
                          <ChatIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary={conversation.title || 'Untitled Conversation'} 
                          secondary={
                            <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <AccessTimeIcon fontSize="small" />
                              {formatDate(conversation.lastActivity || conversation.createdAt)}
                            </Box>
                          }
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography color="textSecondary">
                    No conversations yet
                  </Typography>
                  <Button 
                    component={Link} 
                    to="/conversations/new"
                    startIcon={<AddIcon />}
                    color="primary"
                    variant="contained"
                    sx={{ mt: 2 }}
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
          <Card sx={{ height: '100%' }}>
            <CardHeader 
              title="Your Agents" 
              action={
                <Button 
                  component={Link} 
                  to="/agents/new"
                  startIcon={<AddIcon />}
                  color="primary"
                  variant="contained"
                  size="small"
                >
                  New
                </Button>
              }
            />
            <Divider />
            <CardContent>
              {agents.length > 0 ? (
                <Grid container spacing={2}>
                  {agents.map((agent) => (
                    <Grid item xs={12} sm={6} key={agent._id}>
                      <Paper 
                        elevation={1} 
                        sx={{ 
                          p: 2, 
                          display: 'flex', 
                          flexDirection: 'column',
                          height: '100%',
                          '&:hover': { bgcolor: 'action.hover' },
                          cursor: 'pointer'
                        }}
                        component={Link}
                        to={`/agents/${agent._id}`}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <SmartToyIcon color="primary" sx={{ mr: 1 }} />
                          <Typography variant="subtitle1" noWrap>
                            {agent.name}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="textSecondary" sx={{ 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}>
                          {agent.description || 'No description'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ mt: 'auto', pt: 1 }}>
                          Model: {agent.model || 'Default'}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography color="textSecondary">
                    No agents created yet
                  </Typography>
                  <Button 
                    component={Link} 
                    to="/agents/new"
                    startIcon={<AddIcon />}
                    color="primary"
                    variant="contained"
                    sx={{ mt: 2 }}
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