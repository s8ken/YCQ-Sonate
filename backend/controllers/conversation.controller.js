const asyncHandler = require('express-async-handler');
const Conversation = require('../models/conversation.model');

// @desc    Get all conversations for user
// @route   GET /api/conversations
// @access  Private
const getAllConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ user: req.user.id })
    .populate('agent', 'name description')
    .sort({ updatedAt: -1 });

  res.json({
    success: true,
    count: conversations.length,
    data: conversations
  });
});

// @desc    Get single conversation
// @route   GET /api/conversations/:id
// @access  Private
const getConversation = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id)
    .populate('agent', 'name description')
    .populate('user', 'name email');

  if (!conversation) {
    res.status(404);
    throw new Error('Conversation not found');
  }

  // Check if user owns this conversation
  if (conversation.user._id.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to access this conversation');
  }

  res.json({
    success: true,
    data: conversation
  });
});

// @desc    Create new conversation
// @route   POST /api/conversations
// @access  Private
const createConversation = asyncHandler(async (req, res) => {
  const { title, agent, initialMessage } = req.body;

  if (!title || !agent) {
    res.status(400);
    throw new Error('Please provide title and agent');
  }

  const conversation = await Conversation.create({
    title,
    agent,
    user: req.user.id,
    messages: initialMessage ? [{
      role: 'user',
      content: initialMessage,
      timestamp: new Date()
    }] : []
  });

  const populatedConversation = await Conversation.findById(conversation._id)
    .populate('agent', 'name description')
    .populate('user', 'name email');

  res.status(201).json({
    success: true,
    data: populatedConversation
  });
});

// @desc    Update conversation
// @route   PUT /api/conversations/:id
// @access  Private
const updateConversation = asyncHandler(async (req, res) => {
  let conversation = await Conversation.findById(req.params.id);

  if (!conversation) {
    res.status(404);
    throw new Error('Conversation not found');
  }

  // Check if user owns this conversation
  if (conversation.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to update this conversation');
  }

  conversation = await Conversation.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updatedAt: new Date() },
    { new: true, runValidators: true }
  ).populate('agent', 'name description');

  res.json({
    success: true,
    data: conversation
  });
});

// @desc    Delete conversation
// @route   DELETE /api/conversations/:id
// @access  Private
const deleteConversation = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);

  if (!conversation) {
    res.status(404);
    throw new Error('Conversation not found');
  }

  // Check if user owns this conversation
  if (conversation.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to delete this conversation');
  }

  await Conversation.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Conversation deleted successfully'
  });
});

// @desc    Get messages from conversation
// @route   GET /api/conversations/:id/messages
// @access  Private
const getMessages = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);

  if (!conversation) {
    res.status(404);
    throw new Error('Conversation not found');
  }

  // Check if user owns this conversation
  if (conversation.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to access this conversation');
  }

  res.json({
    success: true,
    count: conversation.messages.length,
    data: conversation.messages
  });
});

// @desc    Add message to conversation
// @route   POST /api/conversations/:id/messages
// @access  Private
const addMessage = asyncHandler(async (req, res) => {
  const { role, content } = req.body;

  if (!role || !content) {
    res.status(400);
    throw new Error('Please provide role and content');
  }

  const conversation = await Conversation.findById(req.params.id);

  if (!conversation) {
    res.status(404);
    throw new Error('Conversation not found');
  }

  // Check if user owns this conversation
  if (conversation.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to add message to this conversation');
  }

  const newMessage = {
    role,
    content,
    timestamp: new Date()
  };

  conversation.messages.push(newMessage);
  conversation.updatedAt = new Date();
  await conversation.save();

  res.status(201).json({
    success: true,
    data: newMessage
  });
});

module.exports = {
  getAllConversations,
  getConversation,
  createConversation,
  updateConversation,
  deleteConversation,
  getMessages,
  addMessage
};