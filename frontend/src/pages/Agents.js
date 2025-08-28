import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  CardActionArea,
  Grid,
  TextField,
  InputAdornment,
  IconButton,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Chip,
  Switch,
  FormControlLabel
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import axios from 'axios';

const Agents = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showPublic, setShowPublic] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, [showPublic]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const url = showPublic ? '/api/agents/public' : '/api/agents';
      const res = await axios.get(url);
      setAgents(res.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching agents:', err);
      setAgents([]);
      setLoading(false);
    }
  };

  const handleCreateAgent = () => {
    navigate('/agents/new');
  };

  const handleMenuOpen = (event, agent) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedAgent(agent);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleDeleteDialogOpen = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };

  const handleEditAgent = () => {
    navigate(`/agents/${selectedAgent._id}/edit`);
    handleMenuClose();
  };

  const handleDuplicateAgent = async () => {
    try {
      const res = await axios.post(`/api/agents/${selectedAgent._id}/duplicate`);
      navigate(`/agents/${res.data._id}/edit`);
      handleMenuClose();
    } catch (err) {
      console.error('Error duplicating agent:', err);
    }
  };

  const handleTogglePublic = async () => {
    try {
      await axios.put(`/api/agents/${selectedAgent._id}`, { 
        isPublic: !selectedAgent.isPublic 
      });
      fetchAgents();
      handleMenuClose();
    } catch (err) {
      console.error('Error updating agent visibility:', err);
    }
  };

  const handleDeleteAgent = async () => {
    try {
      await axios.delete(`/api/agents/${selectedAgent._id}`);
      fetchAgents();
      handleDeleteDialogClose();
    } catch (err) {
      console.error('Error deleting agent:', err);
    }
  };

  // Filter agents based on search term
  const filteredAgents = agents.filter(agent => 
    agent.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {showPublic ? 'Public Agents' : 'My Agents'}
        </Typography>
        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={showPublic}
                onChange={() => setShowPublic(!showPublic)}
                color="primary"
              />
            }
            label="Show Public Agents"
            sx={{ mr: 2 }}
          />
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={handleCreateAgent}
          >
            Create Agent
          </Button>
        </Box>
      </Box>

      <TextField
        fullWidth
        placeholder="Search agents..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredAgents.length > 0 ? (
        <Grid container spacing={3}>
          {filteredAgents.map((agent) => (
            <Grid item xs={12} sm={6} md={4} key={agent._id}>
              <Card 
                elevation={1} 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  '&:hover': { boxShadow: 3 }
                }}
              >
                <CardActionArea 
                  component={Link} 
                  to={`/agents/${agent._id}`}
                  sx={{ flexGrow: 1 }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <SmartToyIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6" noWrap>
                        {agent.name}
                      </Typography>
                      {agent.isPublic && (
                        <PublicIcon 
                          fontSize="small" 
                          color="action" 
                          sx={{ ml: 1 }} 
                        />
                      )}
                    </Box>
                    
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {agent.description || 'No description'}
                    </Typography>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip 
                        label={agent.model || 'Default Model'} 
                        size="small" 
                        color="secondary" 
                        variant="outlined"
                      />
                      
                      <Typography variant="caption" color="text.secondary">
                        {agent.provider || 'Default Provider'}
                      </Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
                
                {!showPublic && (
                  <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuOpen(e, agent);
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchTerm ? 'No agents match your search' : 
              showPublic ? 'No public agents found' : 'You haven\'t created any agents yet'}
          </Typography>
          {!searchTerm && !showPublic && (
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={handleCreateAgent}
              sx={{ mt: 2 }}
            >
              Create Your First Agent
            </Button>
          )}
        </Box>
      )}

      {/* Agent Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditAgent}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Agent</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDuplicateAgent}>
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleTogglePublic}>
          <ListItemIcon>
            {selectedAgent?.isPublic ? 
              <LockIcon fontSize="small" /> : 
              <PublicIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText>
            {selectedAgent?.isPublic ? 'Make Private' : 'Make Public'}
          </ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteDialogOpen}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
        <DialogTitle>Delete Agent</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this agent? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDeleteAgent} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Agents;