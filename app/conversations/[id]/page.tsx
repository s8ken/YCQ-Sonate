"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Avatar,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  FormControl,
  InputLabel,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
} from "@mui/material"
import SendIcon from "@mui/icons-material/Send"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import SmartToyIcon from "@mui/icons-material/SmartToy"
import PersonIcon from "@mui/icons-material/Person"
import PsychologyIcon from "@mui/icons-material/Psychology"
import axios from "axios"
import MessageWithCI from "../../../components/conversation/MessageWithCI"
import { io } from "socket.io-client"

const ConversationDetail = () => {
  const params = useParams()
  const router = useRouter()
  const id = params.id
  const [conversation, setConversation] = useState(null)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const [agents, setAgents] = useState([])
  const [selectedAgent, setSelectedAgent] = useState("")
  const [ciEnabled, setCiEnabled] = useState(true)
  const [menuAnchorEl, setMenuAnchorEl] = useState(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const messagesEndRef = useRef(null)
  const socketRef = useRef(null)

  const navigate = (path: string) => {
    router.push(path)
  }

  useEffect(() => {
    if (!id || id === "undefined" || id === "null") {
      console.error("Invalid conversation ID:", id)
      navigate("/conversations")
      return
    }
  }, [id])

  useEffect(() => {
    socketRef.current = io()

    if (id && id !== "undefined" && id !== "null") {
      socketRef.current.emit("joinConversation", id)
    }

    socketRef.current.on("newMessage", (newMessage) => {
      setConversation((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          messages: [...prev.messages, newMessage],
        }
      })
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [id])

  useEffect(() => {
    const fetchConversation = async () => {
      if (!id || id === "undefined" || id === "null") {
        return
      }

      try {
        setLoading(true)
        const res = await axios.get(`/api/conversations/${id}`)
        setConversation(res.data.data)
        setEditTitle(res.data.data.title || "Untitled Conversation")
        setLoading(false)
      } catch (err) {
        console.error("Error fetching conversation:", err)
        if (err.response?.status === 404) {
          setError("Conversation not found")
          setTimeout(() => {
            navigate("/conversations")
          }, 2000)
        } else {
          setError("Failed to load conversation")
        }
        setLoading(false)
      }
    }

    const fetchAgents = async () => {
      try {
        const res = await axios.get("/api/agents")
        const agentsData = res.data.data || []
        setAgents(agentsData)
        if (agentsData.length > 0) {
          setSelectedAgent(agentsData[0]._id)
        }
      } catch (err) {
        console.error("Error fetching agents:", err)
        setAgents([])
      }
    }

    if (id && id !== "undefined" && id !== "null") {
      fetchConversation()
      fetchAgents()
    }
  }, [id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversation?.messages])

  const handleSendMessage = async () => {
    if (!message.trim()) return

    try {
      setSending(true)
      const newMessage = {
        content: message,
        sender: "user",
      }

      if (selectedAgent) {
        newMessage.agentId = selectedAgent
      }

      await axios.post(`/api/conversations/${id}/messages`, newMessage)
      setMessage("")
      setSending(false)
    } catch (err) {
      console.error("Error sending message:", err)
      setSending(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setMenuAnchorEl(null)
  }

  const handleEditDialogOpen = () => {
    setEditDialogOpen(true)
    handleMenuClose()
  }

  const handleEditDialogClose = () => {
    setEditDialogOpen(false)
  }

  const handleUpdateTitle = async () => {
    try {
      await axios.put(`/api/conversations/${id}`, { title: editTitle })
      setConversation((prev) => ({ ...prev, title: editTitle }))
      handleEditDialogClose()
    } catch (err) {
      console.error("Error updating conversation title:", err)
    }
  }

  const handleDeleteConversation = async () => {
    try {
      await axios.delete(`/api/conversations/${id}`)
      navigate("/conversations")
    } catch (err) {
      console.error("Error deleting conversation:", err)
    }
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
        <Button variant="contained" onClick={() => navigate("/conversations")} sx={{ mt: 2 }}>
          Back to Conversations
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ height: "calc(100vh - 120px)", display: "flex", flexDirection: "column" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5">{conversation?.title || "Untitled Conversation"}</Typography>
        <Box>
          <IconButton onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>
          <Menu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={handleEditDialogOpen}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit Title</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleDeleteConversation}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Delete Conversation</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      <Paper
        elevation={1}
        sx={{
          flexGrow: 1,
          overflow: "auto",
          mb: 2,
          p: 2,
          bgcolor: "background.default",
          borderRadius: 2,
        }}
      >
        {conversation?.messages?.length > 0 ? (
          conversation.messages.map((msg, index) => {
            const isUser = msg.sender === "user"
            const agent = agents.find((a) => a._id === msg.agentId)

            const enhancedMsg = {
              ...msg,
              ...(ciEnabled && !isUser
                ? {
                    ciModel: msg.ciModel || "Symbi Core",
                    trustScore: msg.trustScore || Math.random() * 0.3 + 0.7,
                    contextTags: msg.contextTags || ["conversation", "context-aware"],
                    encryptedContent: msg.encryptedContent || false,
                    agentId: msg.agentId || null,
                  }
                : {}),
            }

            return ciEnabled ? (
              <MessageWithCI key={index} message={enhancedMsg} isUser={isUser} timestamp={msg.timestamp} />
            ) : (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  flexDirection: isUser ? "row-reverse" : "row",
                  mb: 2,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: isUser ? "primary.main" : "secondary.main",
                    mr: isUser ? 0 : 1,
                    ml: isUser ? 1 : 0,
                  }}
                >
                  {isUser ? <PersonIcon /> : <SmartToyIcon />}
                </Avatar>
                <Box
                  sx={{
                    maxWidth: "70%",
                    p: 2,
                    borderRadius: 2,
                    bgcolor: isUser ? "primary.light" : "background.paper",
                    color: isUser ? "primary.contrastText" : "text.primary",
                    position: "relative",
                  }}
                >
                  {!isUser && agent && <Chip label={agent.name} size="small" color="secondary" sx={{ mb: 1 }} />}
                  <Typography variant="body1">{msg.content}</Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      position: "absolute",
                      right: 8,
                      bottom: 4,
                      opacity: 0.7,
                    }}
                  >
                    {formatTimestamp(msg.timestamp)}
                  </Typography>
                </Box>
              </Box>
            )
          })
        ) : (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography color="text.secondary">No messages yet. Start the conversation!</Typography>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Paper>

      <Paper
        elevation={2}
        component="form"
        sx={{
          p: 2,
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
        }}
        onSubmit={(e) => {
          e.preventDefault()
          handleSendMessage()
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 200, mr: 2 }}>
            <InputLabel id="agent-select-label">Select Agent</InputLabel>
            <Select
              labelId="agent-select-label"
              value={selectedAgent}
              label="Select Agent"
              onChange={(e) => setSelectedAgent(e.target.value)}
            >
              {agents.map((agent) => (
                <MenuItem key={agent._id} value={agent._id}>
                  {agent.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControlLabel
            control={<Switch checked={ciEnabled} onChange={(e) => setCiEnabled(e.target.checked)} color="secondary" />}
            label={
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <PsychologyIcon sx={{ mr: 0.5 }} fontSize="small" />
                <Typography variant="body2">CI Integration</Typography>
              </Box>
            }
          />
        </Box>

        <Box sx={{ display: "flex" }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            variant="outlined"
            sx={{ mr: 1 }}
          />
          <Button
            variant="contained"
            color="primary"
            endIcon={<SendIcon />}
            onClick={handleSendMessage}
            disabled={sending || !message.trim()}
          >
            {sending ? <CircularProgress size={24} /> : "Send"}
          </Button>
        </Box>
      </Paper>

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
    </Box>
  )
}

export default ConversationDetail
