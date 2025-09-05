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
  Alert,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import ChatIcon from '@mui/icons-material/Chat';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import FunctionsIcon from '@mui/icons-material/Functions';
import InfoIcon from '@mui/icons-material/Info';
import axios from 'axios';
import AssistantEditDialog from '../components/assistants/AssistantEditDialog';

const Assistants = () => {
  const navigate = useNavigate();
  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedAssistant, setSelectedAssistant] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState(null);
  const [functionsDialogOpen, setFunctionsDialogOpen] = useState(false);
  const [functions, setFunctions] = useState([]);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetchAssistants();
    fetchFunctions();
  }, []);

  const fetchAssistants = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/assistant/list');
      if (response.data.success) {
        setAssistants(response.data.assistants);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching assistants:', err);
      if (err.response?.status === 400 && err.response?.data?.error?.includes('OpenAI API key')) {
        setError('OpenAI API key not found. Please add your OpenAI API key in Settings.');
      } else {
        setError('Failed to load assistants. Please try again.');
      }
    } finally {
      setLoading(false);
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

  const handleCreateAssistant = () => {
    navigate('/assistants/new');
  };

  const handleMenuOpen = (event, assistant) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedAssistant(assistant);
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
    setSelectedAssistant(null);
  };

  const handleDeleteAssistant = async () => {
    try {
      await axios.delete(`/api/assistant/${selectedAssistant.id}`);
      setAssistants(assistants.filter(a => a.id !== selectedAssistant.id));
      handleDeleteDialogClose();
    } catch (err) {
      console.error('Error deleting assistant:', err);
      setError('Failed to delete assistant. Please try again.');
    }
  };

  const handleChatWithAssistant = (assistant) => {
    navigate(`/assistants/${assistant.id}/chat`);
    handleMenuClose();
  };

  const handleViewFunctions = () => {
    setFunctionsDialogOpen(true);
  };

  const filteredAssistants = assistants.filter(assistant =>
    assistant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            OpenAI Assistants
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create and manage AI assistants with access to your app data
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ChatIcon />}
            onClick={() => navigate('/assistants/latest/chat')}
          >
            Use Most Recent
          </Button>
          <Button
            variant="outlined"
            startIcon={<FunctionsIcon />}
            onClick={handleViewFunctions}
          >
            View Functions
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateAssistant}
          >
            Create Assistant
          </Button>
        </Box>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search assistants..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
        />
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredAssistants.length > 0 ? (
        <Grid container spacing={3}>
          {filteredAssistants.map((assistant) => (
            <Grid item xs={12} sm={6} md={4} key={assistant.id}>
              <Card 
                className="agent-card"
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3
                  }
                }}
              >
                <CardActionArea 
                  onClick={() => navigate(`/assistants/${assistant.id}/chat`)}
                  sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <SmartToyIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6" component="h2" className="agent-card-title">
                          {assistant.name}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuOpen(e, assistant);
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                    
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      className="agent-card-description"
                      sx={{ mb: 2 }}
                    >
                      Model: {assistant.model}
                    </Typography>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip 
                        label="OpenAI Assistant"
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(assistant.created_at)}
                      </Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <SmartToyIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No assistants found
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {searchTerm ? 
              'No assistants match your search criteria.' : 
              'Create your first OpenAI Assistant to get started.'
            }
          </Typography>
          {!searchTerm && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateAssistant}
              sx={{ mt: 2 }}
            >
              Create Assistant
            </Button>
          )}
        </Paper>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleChatWithAssistant(selectedAssistant)}>
          <ListItemIcon>
            <ChatIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Chat</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setEditing(selectedAssistant); handleMenuClose(); }}>
          <ListItemIcon>
            <InfoIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteDialogOpen}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Delete Assistant</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{selectedAssistant?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDeleteAssistant} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Functions Dialog */}
      <Dialog
        open={functionsDialogOpen}
        onClose={() => setFunctionsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FunctionsIcon sx={{ mr: 1 }} />
            Available Functions
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            These functions allow your assistants to access and interact with your app data:
          </Typography>
          <Grid container spacing={2}>
            {functions.map((func, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {func.function.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {func.function.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFunctionsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Assistant Dialog */}
      <AssistantEditDialog
        open={!!editing}
        assistant={editing}
        onClose={(saved) => { setEditing(null); if (saved) fetchAssistants(); }}
      />
    </Box>
  );
};

export default Assistants;
