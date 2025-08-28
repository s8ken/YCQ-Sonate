const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, deleteAccount, getApiKeys, addApiKey, updateApiKey, deleteApiKey } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

// User profile routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.delete('/account', protect, deleteAccount);

// API key management routes
router.get('/api-keys', protect, getApiKeys);
router.post('/api-keys', protect, addApiKey);
router.put('/api-keys/:id', protect, updateApiKey);
router.delete('/api-keys/:id', protect, deleteApiKey);

module.exports = router;
