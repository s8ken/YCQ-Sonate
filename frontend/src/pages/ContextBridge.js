import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Link as LinkIcon,
  LinkOff as LinkOffIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import '../styles/builder.css';

const ContextBridge = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State
  const [contexts, setContexts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedTag, setSelectedTag] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [bridgeDialogOpen, setBridgeDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedContext, setSelectedContext] = useState(null);
  
  // Form state
  const [newContextForm, setNewContextForm] = useState({
    tag: '',
    source: 'symbi',
    data: '',
    trustScore: 5,
  });
  
  const [bridgeForm, setBridgeForm] = useState({
    fromTag: '',
    toTag: '',
    data: '',
  });
  
  // Fetch contexts
  const fetchContexts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let url = `/api/context?page=${currentPage}&limit=10`;
      
      if (selectedSource !== 'all') {
        url += `&source=${selectedSource}`;
      }
      
      if (selectedTag) {
        url += `&tag=${selectedTag}`;
      }
      
      const response = await axios.get(url);
      setContexts(response.data.contexts);
    } catch (err) {
      console.error('Error fetching contexts:', err);
      setError('Failed to fetch contexts. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Create new context
  const createContext = async () => {
    try {
      const payload = {
        ...newContextForm,
        data: JSON.parse(newContextForm.data),
      };
      
      await axios.post('/api/context', payload);
      setCreateDialogOpen(false);
      setNewContextForm({
        tag: '',
        source: 'symbi',
        data: '',
        trustScore: 5,
      });
      fetchContexts();
    } catch (err) {
      console.error('Error creating context:', err);
      setError('Failed to create context. Please check your input and try again.');
    }
  };
  
  // Create context bridge
  const createBridge = async () => {
    try {
      const payload = {
        ...bridgeForm,
        data: JSON.parse(bridgeForm.data),
      };
      
      await axios.post('/api/context/bridge', payload);
      setBridgeDialogOpen(false);
      setBridgeForm({
        fromTag: '',
        toTag: '',
        data: '',
      });
      fetchContexts();
    } catch (err) {
      console.error('Error creating bridge:', err);
      setError('Failed to create bridge. Please check your input and try again.');
    }
  };
  
  // Deactivate context
  const deactivateContext = async (contextId) => {
    try {
      await axios.put(`/api/context/${contextId}/deactivate`);
      fetchContexts();
    } catch (err) {
      console.error('Error deactivating context:', err);
      setError('Failed to deactivate context. Please try again.');
    }
  };
  
  // Delete context
  const deleteContext = async () => {
    try {
      await axios.delete(`/api/context/${selectedContext._id}`);
      setDeleteDialogOpen(false);
      fetchContexts();
    } catch (err) {
      console.error('Error deleting context:', err);
      setError('Failed to delete context. Please try again.');
    }
  };
  
  // Handle source change
  const handleSourceChange = (event, newValue) => {
    setSelectedSource(newValue);
    setCurrentPage(1);
  };
  
  // Handle form changes
  const handleNewContextChange = (e) => {
    const { name, value } = e.target;
    setNewContextForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleBridgeFormChange = (e) => {
    const { name, value } = e.target;
    setBridgeForm(prev => ({ ...prev, [name]: value }));
  };
  
  // Effect to fetch contexts on mount and when dependencies change
  useEffect(() => {
    fetchContexts();
  }, [currentPage, selectedSource, selectedTag]);
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Context Bridge
        </Typography>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<LinkIcon />}
            onClick={() => setBridgeDialogOpen(true)}
            sx={{ mr: 1 }}
          >
            Create Bridge
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            New Context
          </Button>
        </Box>
      </Box>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Filter by tag..."
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            sx={{ mr: 2 }}
          />
          <IconButton onClick={fetchContexts}>
            <RefreshIcon />
          </IconButton>
        </Box>
        
        <Tabs
          value={selectedSource}
          onChange={handleSourceChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="All Sources" value="all" />
          <Tab label="Symbi" value="symbi" />
          <Tab label="Overseer" value="overseer" />
          <Tab label="System" value="system" />
        </Tabs>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error">{error}</Typography>
          <Button
            variant="outlined"
            color="primary"
            onClick={fetchContexts}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Paper>
      ) : contexts.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography>No contexts found.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {contexts.map((context) => (
            <Grid item xs={12} sm={6} md={4} key={context._id}>
              <Card 
                className={`context-node ${context.source}`}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  opacity: context.isActive ? 1 : 0.6,
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" component="div">
                      {context.tag}
                    </Typography>
                    <Box>
                      {context.isActive && (
                        <IconButton 
                          size="small" 
                          onClick={() => deactivateContext(context._id)}
                          title="Deactivate"
                        >
                          <LinkOffIcon fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton 
                        size="small" 
                        onClick={() => {
                          setSelectedContext(context);
                          setDeleteDialogOpen(true);
                        }}
                        title="Delete"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Source: {context.source.charAt(0).toUpperCase() + context.source.slice(1)}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Created: {formatDate(context.createdAt)}
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Trust Score: {context.trustScore}/5
                    </Typography>
                    <Box 
                      sx={{ 
                        width: '100%', 
                        height: 8, 
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        overflow: 'hidden',
                        mt: 1
                      }}
                    >
                      <Box 
                        sx={{ 
                          width: `${(context.trustScore / 5) * 100}%`, 
                          height: '100%', 
                          bgcolor: context.trustScore > 3 ? 'success.main' : context.trustScore > 1 ? 'warning.main' : 'error.main'
                        }} 
                      />
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Data:
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1,
                      bgcolor: theme.palette.background.default,
                      maxHeight: 120,
                      overflow: 'auto',
                    }}
                  >
                    <pre style={{ margin: 0, fontSize: '0.75rem' }}>
                      {JSON.stringify(context.data, null, 2)}
                    </pre>
                  </Paper>
                  
                  {context.metadata && context.metadata.bridgedFrom && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Bridged from: {context.metadata.bridgedFrom}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Create Context Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Context</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tag"
                name="tag"
                value={newContextForm.tag}
                onChange={handleNewContextChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Source</InputLabel>
                <Select
                  name="source"
                  value={newContextForm.source}
                  onChange={handleNewContextChange}
                  label="Source"
                >
                  <MenuItem value="symbi">Symbi</MenuItem>
                  <MenuItem value="overseer">Overseer</MenuItem>
                  <MenuItem value="system">System</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Data (JSON)"
                name="data"
                value={newContextForm.data}
                onChange={handleNewContextChange}
                multiline
                rows={4}
                required
                placeholder='{"key": "value"}'
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Trust Score</InputLabel>
                <Select
                  name="trustScore"
                  value={newContextForm.trustScore}
                  onChange={handleNewContextChange}
                  label="Trust Score"
                >
                  {[1, 2, 3, 4, 5].map(score => (
                    <MenuItem key={score} value={score}>{score}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={createContext} 
            color="primary" 
            variant="contained"
            disabled={!newContextForm.tag || !newContextForm.data}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Create Bridge Dialog */}
      <Dialog
        open={bridgeDialogOpen}
        onClose={() => setBridgeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Context Bridge</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Create a bridge between Symbi and Overseer contexts.
          </DialogContentText>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="From Tag"
                name="fromTag"
                value={bridgeForm.fromTag}
                onChange={handleBridgeFormChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="To Tag"
                name="toTag"
                value={bridgeForm.toTag}
                onChange={handleBridgeFormChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bridge Data (JSON)"
                name="data"
                value={bridgeForm.data}
                onChange={handleBridgeFormChange}
                multiline
                rows={4}
                required
                placeholder='{"key": "value"}'
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBridgeDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={createBridge} 
            color="primary" 
            variant="contained"
            disabled={!bridgeForm.fromTag || !bridgeForm.toTag || !bridgeForm.data}
          >
            Create Bridge
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Context</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this context? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={deleteContext} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ContextBridge;