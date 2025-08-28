const express = require('express');
const router = express.Router();
const { getAllConversations, getConversation, createConversation, updateConversation, deleteConversation, getMessages, addMessage } = require('../controllers/conversation.controller');
const { protect } = require('../middleware/auth.middleware');

// Conversation routes
router.get('/', protect, getAllConversations);
router.get('/:id', protect, getConversation);
router.post('/', protect, createConversation);
router.put('/:id', protect, updateConversation);
router.delete('/:id', protect, deleteConversation);

// Message routes within conversations
router.get('/:id/messages', protect, getMessages);
router.post('/:id/messages', protect, addMessage);

module.exports = router;
