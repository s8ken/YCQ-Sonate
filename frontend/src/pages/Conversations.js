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
  Chip
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import ChatIcon from '@mui/icons-material/Chat';
import axios from 'axios';

const Conversations = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, [showArchived]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/conversations?archived=${showArchived}`);
      setConversations(res.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setConversations([]);
      setLoading(false);
    }
  };

  const handleCreateConversation = async () => {
    try {
      // First, fetch available agents to get a default agent
      const agentsRes = await axios.get('/api/agents');
      const agents = agentsRes.data.data || [];
      
      if (agents.length === 0) {
        console.error('No agents available. Please create an agent first.');
        // Navigate to agent creation page
        navigate('/agents/new');
        return;
      }
      
      // Use the first available agent as default
      const defaultAgent = agents[0]._id;
      
      const res = await axios.post('/api/conversations', {
        title: 'New Conversation',
        agent: defaultAgent
      });
      navigate(`/conversations/${res.data._id}`);
    } catch (err) {
      console.error('Error creating conversation:', err);
      // If it's an auth error, the user might need to log in again
      if (err.response?.status === 401) {
        console.error('Authentication failed. Please log in again.');
      }
    }
  };

  const handleMenuOpen = (event, conversation) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedConversation(conversation);
    setEditTitle(conversation.title || 'Untitled Conversation');
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

  const handleEditDialogOpen = () => {
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
  };

  const handleUpdateTitle = async () => {
    try {
      await axios.put(`/api/conversations/${selectedConversation._id}`, { title: editTitle });
      fetchConversations();
      handleEditDialogClose();
    } catch (err) {
      console.error('Error updating conversation title:', err);
    }
  };

  const handleDeleteConversation = async () => {
    try {
      await axios.delete(`/api/conversations/${selectedConversation._id}`);
      fetchConversations();
      handleDeleteDialogClose();
    } catch (err) {
      console.error('Error deleting conversation:', err);
    }
  };

  const handleToggleArchive = async () => {
    try {
      await axios.put(`/api/conversations/${selectedConversation._id}`, { 
        isArchived: !selectedConversation.isArchived 
      });
      fetchConversations();
      handleMenuClose();
    } catch (err) {
      console.error('Error archiving/unarchiving conversation:', err);
    }
  };

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

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conversation => 
    conversation.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {showArchived ? 'Archived Conversations' : 'Conversations'}
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={() => setShowArchived(!showArchived)}
            sx={{ mr: 1 }}
          >
            {showArchived ? 'Show Active' : 'Show Archived'}
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={handleCreateConversation}
          >
            New Conversation
          </Button>
        </Box>
      </Box>

      <TextField
        fullWidth
        placeholder="Search conversations..."
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
      ) : filteredConversations.length > 0 ? (
        <Grid container spacing={2}>
          {filteredConversations.map((conversation) => (
            <Grid item xs={12} sm={6} md={4} key={conversation._id}>
              <Card 
                elevation={1} 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative'
                }}
              >
                <CardActionArea 
                  component={Link} 
                  to={`/conversations/${conversation._id}`}
                  sx={{ flexGrow: 1 }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <ChatIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6" noWrap>
                        {conversation.title || 'Untitled Conversation'}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {conversation.messages?.length || 0} messages
                    </Typography>
                    
                    {conversation.isArchived && (
                      <Chip 
                        label="Archived" 
                        size="small" 
                        color="default" 
                        sx={{ mb: 1 }} 
                      />
                    )}
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Typography variant="caption" color="text.secondary">
                      Last activity: {formatDate(conversation.lastActivity || conversation.createdAt)}
                    </Typography>
                  </CardContent>
                </CardActionArea>
                
                <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                  <IconButton 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuOpen(e, conversation);
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchTerm ? 'No conversations match your search' : 'No conversations found'}
          </Typography>
          {!searchTerm && (
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={handleCreateConversation}
              sx={{ mt: 2 }}
            >
              Start a New Conversation
            </Button>
          )}
        </Box>
      )}

      {/* Conversation Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditDialogOpen}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Title</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleToggleArchive}>
          <ListItemIcon>
            {selectedConversation?.isArchived ? 
              <UnarchiveIcon fontSize="small" /> : 
              <ArchiveIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText>
            {selectedConversation?.isArchived ? 'Unarchive' : 'Archive'}
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteDialogOpen}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Edit Title Dialog */}
      <Dialog open={editDialogOpen} onClose={handleEditDialogClose}>
        <DialogTitle>Edit Conversation Title</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Conversation Title"
            type="text"
            fullWidth
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose}>Cancel</Button>
          <Button onClick={handleUpdateTitle} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
        <DialogTitle>Delete Conversation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this conversation? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDeleteConversation} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Conversations;