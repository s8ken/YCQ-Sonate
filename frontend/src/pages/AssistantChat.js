import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  List,
  ListItem,
  Avatar,
  Divider,
  Chip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import RefreshIcon from '@mui/icons-material/Refresh';
import axios from 'axios';

const AssistantChat = () => {
  const { assistantId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [threadId, setThreadId] = useState(null);
  const [assistant, setAssistant] = useState(null);

  useEffect(() => {
    initializeChat();
  }, [assistantId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = async () => {
    try {
      setLoading(true);
      setError(null);
      // Resolve assistant id if 'latest'
      let resolvedAssistantId = assistantId;
      if (assistantId === 'latest') {
        try {
          const latest = await axios.get('/api/assistant/latest');
          if (latest.data?.success && latest.data?.assistant?.id) {
            resolvedAssistantId = latest.data.assistant.id;
          }
        } catch (e) {
          // ignore, will proceed without assistant
        }
      }

      // Create a new thread for this conversation
      const threadResponse = await axios.post('/api/assistant/thread/create');
      if (threadResponse.data.success) {
        setThreadId(threadResponse.data.thread.id);
      }
      
      // Get assistant info (from list) if resolved
      if (resolvedAssistantId) {
        const assistantsResponse = await axios.get('/api/assistant/list');
        if (assistantsResponse.data.success) {
          const foundAssistant = assistantsResponse.data.assistants.find(a => a.id === resolvedAssistantId);
          setAssistant(foundAssistant);
        }
      }
      
    } catch (err) {
      console.error('Error initializing chat:', err);
      if (err.response?.status === 400 && err.response?.data?.error?.includes('OpenAI API key')) {
        setError('OpenAI API key not found. Please add your OpenAI API key in Settings.');
      } else {
        setError('Failed to initialize chat. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !threadId || sending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);
    setError(null);

    // Add user message to UI immediately
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: messageText,
      created_at: Date.now() / 1000
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await axios.post('/api/assistant/message', {
        threadId,
        assistantId: assistant?.id || (assistantId !== 'latest' ? assistantId : undefined),
        message: messageText,
        session_id: threadId // use thread as stable session for capsule/trust
      });

      if (response.data.success) {
        // Add assistant response to UI
        const assistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: response.data.result.response,
          created_at: Date.now() / 1000
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.response?.data?.details || 'Failed to send message. Please try again.');
      
      // Remove the user message if sending failed
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleBack = () => {
    navigate('/assistants');
  };

  const handleNewChat = () => {
    setMessages([]);
    setThreadId(null);
    initializeChat();
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper sx={{ p: 2, borderRadius: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={handleBack} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
              <SmartToyIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">
                {assistant?.name || 'Assistant'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {assistant?.model || 'OpenAI Assistant'}
              </Typography>
            </Box>
          </Box>
          
          <Box>
            <IconButton onClick={handleNewChat} title="New Chat">
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ m: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Messages */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {messages.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <SmartToyIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Start a conversation
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your assistant has access to your app data and can help you with various tasks.
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {messages.map((message, index) => (
              <ListItem key={message.id} sx={{ flexDirection: 'column', alignItems: 'stretch', p: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                    mb: 1
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: '70%',
                      display: 'flex',
                      alignItems: 'flex-start',
                      flexDirection: message.role === 'user' ? 'row-reverse' : 'row'
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        mx: 1,
                        bgcolor: message.role === 'user' ? 'secondary.main' : 'primary.main'
                      }}
                    >
                      {message.role === 'user' ? <PersonIcon /> : <SmartToyIcon />}
                    </Avatar>
                    
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: message.role === 'user' ? 'primary.main' : 'grey.100',
                        color: message.role === 'user' ? 'primary.contrastText' : 'text.primary',
                        borderRadius: 2
                      }}
                    >
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {message.content}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          mt: 1,
                          opacity: 0.7
                        }}
                      >
                        {formatTime(message.created_at)}
                      </Typography>
                    </Paper>
                  </Box>
                </Box>
                
                {index < messages.length - 1 && <Divider sx={{ my: 1 }} />}
              </ListItem>
            ))}
            
            {sending && (
              <ListItem sx={{ justifyContent: 'flex-start', p: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}>
                    <SmartToyIcon />
                  </Avatar>
                  <Paper sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CircularProgress size={16} sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Assistant is thinking...
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              </ListItem>
            )}
          </List>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Message Input */}
      <Paper sx={{ p: 2, borderRadius: 0 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={sending || !threadId}
          />
          <Button
            variant="contained"
            endIcon={sending ? <CircularProgress size={20} /> : <SendIcon />}
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending || !threadId}
            sx={{ minWidth: 'auto', px: 3 }}
          >
            Send
          </Button>
        </Box>
        
        {threadId && (
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Chip
              label={`Thread: ${threadId.substring(0, 8)}...`}
              size="small"
              variant="outlined"
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default AssistantChat;
