const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');

  if (user) {
    res.json({
      success: true,
      data: user
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      data: {
        _id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
      }
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
const deleteAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    await User.findByIdAndDelete(req.user.id);
    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get user API keys
// @route   GET /api/users/api-keys
// @access  Private
const getApiKeys = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('apiKeys');

  if (user) {
    res.json({
      success: true,
      data: user.apiKeys || []
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Add new API key
// @route   POST /api/users/api-keys
// @access  Private
const addApiKey = asyncHandler(async (req, res) => {
  const { name, provider, key } = req.body;

  if (!name || !provider || !key) {
    res.status(400);
    throw new Error('Please provide name, provider, and key');
  }

  const user = await User.findById(req.user.id);

  if (user) {
    const newApiKey = {
      name,
      provider,
      key,
      createdAt: new Date()
    };

    user.apiKeys = user.apiKeys || [];
    user.apiKeys.push(newApiKey);
    await user.save();

    res.status(201).json({
      success: true,
      data: newApiKey,
      message: 'API key added successfully'
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update API key
// @route   PUT /api/users/api-keys/:id
// @access  Private
const updateApiKey = asyncHandler(async (req, res) => {
  const { name, provider, key } = req.body;
  const user = await User.findById(req.user.id);

  if (user && user.apiKeys) {
    const apiKey = user.apiKeys.id(req.params.id);

    if (apiKey) {
      apiKey.name = name || apiKey.name;
      apiKey.provider = provider || apiKey.provider;
      apiKey.key = key || apiKey.key;
      apiKey.updatedAt = new Date();

      await user.save();

      res.json({
        success: true,
        data: apiKey,
        message: 'API key updated successfully'
      });
    } else {
      res.status(404);
      throw new Error('API key not found');
    }
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Delete API key
// @route   DELETE /api/users/api-keys/:id
// @access  Private
const deleteApiKey = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user && user.apiKeys) {
    const apiKey = user.apiKeys.id(req.params.id);

    if (apiKey) {
      user.apiKeys.pull(req.params.id);
      await user.save();

      res.json({
        success: true,
        message: 'API key deleted successfully'
      });
    } else {
      res.status(404);
      throw new Error('API key not found');
    }
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = {
  getProfile,
  updateProfile,
  deleteAccount,
  getApiKeys,
  addApiKey,
  updateApiKey,
  deleteApiKey
};