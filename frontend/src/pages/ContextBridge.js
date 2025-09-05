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
  Search as SearchIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import { flags } from '../lib/flags';
import { LEX } from '../config/lexicon';
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
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedContext, setSelectedContext] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [weaviateStatus, setWeaviateStatus] = useState({ connected: false });
  
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
  
  const [searchOptions, setSearchOptions] = useState({
    limit: 10,
    threshold: 0.7
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
  
  // Semantic search using Weaviate
  const performSemanticSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setError(null);
    
    try {
      const response = await axios.get('/api/context/search', {
        params: {
          query: searchQuery,
          limit: searchOptions.limit,
          threshold: searchOptions.threshold
        }
      });
      
      setSearchResults(response.data.results);
    } catch (err) {
      console.error('Error performing semantic search:', err);
      setError('Semantic search failed. Falling back to regular search.');
      // Fallback to regular context fetch
      fetchContexts();
    } finally {
      setIsSearching(false);
    }
  };
  
  // Get bridge recommendations
  const getBridgeRecommendations = async (sourceTag) => {
    try {
      const response = await axios.get('/api/context/recommendations', {
        params: {
          sourceTag,
          limit: 5
        }
      });
      
      setRecommendations(response.data.recommendations);
    } catch (err) {
      console.error('Error getting bridge recommendations:', err);
    }
  };
  
  // Check Weaviate status
  const checkWeaviateStatus = async () => {
    try {
      const response = await axios.get('/api/context/weaviate/status');
      setWeaviateStatus(response.data);
    } catch (err) {
      console.error('Error checking Weaviate status:', err);
      setWeaviateStatus({ connected: false, error: err.message });
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
    
    // Get recommendations when fromTag changes
    if (name === 'fromTag' && value.trim()) {
      getBridgeRecommendations(value.trim());
    }
  };
  
  const handleSearchOptionsChange = (event) => {
    const { name, value } = event.target;
    setSearchOptions(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleViewContext = (context) => {
    setSelectedContext(context);
    setViewDialogOpen(true);
  };

  const handleEditContext = (context) => {
     setSelectedContext(context);
     setEditDialogOpen(true);
   };
  
  // Effect to fetch contexts on mount and when dependencies change
  useEffect(() => {
    fetchContexts();
    checkWeaviateStatus();
  }, [currentPage, selectedSource, selectedTag]);
  
  // Handle search query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      const debounceTimer = setTimeout(() => {
        performSemanticSearch();
      }, 500);
      
      return () => clearTimeout(debounceTimer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, searchOptions]);
  
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
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {LEX.app.contextTitle}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {LEX.app.contextSubtitle}
            </Typography>
          </Box>
          {/* POC: no vector banner */}
        </Box>
        
        {/* Semantic Search Bar */}
        <Paper sx={{ p: 2, mb: 3, background: 'rgba(255, 255, 255, 0.05)' }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Search contexts semantically (e.g., 'user authentication issues', 'payment processing')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: isSearching ? (
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                ) : (
                  <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                ),
                endAdornment: searchQuery && (
                  <IconButton onClick={clearSearch} size="small">
                    <LinkOffIcon />
                  </IconButton>
                )
              }}
              disabled={!flags.vector || !weaviateStatus.connected}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.2)'
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(102, 126, 234, 0.5)'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea'
                  }
                }
              }}
            />
            
            {weaviateStatus.connected && (
              <Box sx={{ display: 'flex', gap: 1, minWidth: 200 }}>
                <TextField
                  size="small"
                  label="Limit"
                  type="number"
                  name="limit"
                  value={searchOptions.limit}
                  onChange={handleSearchOptionsChange}
                  inputProps={{ min: 1, max: 50 }}
                  sx={{ width: 80 }}
                />
                <TextField
                  size="small"
                  label="Threshold"
                  type="number"
                  name="threshold"
                  value={searchOptions.threshold}
                  onChange={handleSearchOptionsChange}
                  inputProps={{ min: 0, max: 1, step: 0.1 }}
                  sx={{ width: 100 }}
                />
              </Box>
            )}
          </Box>
          
          {searchQuery && searchResults.length > 0 && (
            <Typography variant="body2" color="text.secondary">
              Found {searchResults.length} semantically similar contexts
            </Typography>
          )}
          
          {!weaviateStatus.connected && (
            <Typography variant="body2" color="warning.main">
              ⚠️ Vector search unavailable. Using basic text search instead.
            </Typography>
          )}
        </Paper>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<LinkIcon />}
            onClick={() => setBridgeDialogOpen(true)}
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
          <Tab label="All" value="all" />
          <Tab label="Symbi" value="symbi" />
        </Tabs>
      </Paper>
      
      {/* Context List */}
      <Grid container spacing={3}>
        {loading || isSearching ? (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          </Grid>
        ) : error ? (
          <Grid item xs={12}>
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
          </Grid>
        ) : (
          // Show search results if searching, otherwise show regular contexts
          (searchQuery ? searchResults : contexts).length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  {searchQuery ? 'No matching contexts found' : 'No contexts found'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchQuery 
                    ? 'Try adjusting your search query or similarity threshold.'
                    : 'Create your first context to get started.'
                  }
                </Typography>
              </Paper>
            </Grid>
          ) : (
            (searchQuery ? searchResults : contexts).map((context) => (
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
            ))
           )
         )}
       </Grid>
      
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
      
      {/* POC: no bridge dialog */}
      
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
