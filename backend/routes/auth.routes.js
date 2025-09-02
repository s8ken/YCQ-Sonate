const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, updateProfile, logoutUser } = require('../controllers/auth.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');

// Authentication routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
// Stateless logout endpoint
router.post('/logout', optionalAuth, logoutUser);

module.exports = router;
