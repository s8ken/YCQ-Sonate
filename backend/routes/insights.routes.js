const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { timeline } = require('../controllers/insights.controller');

router.get('/timeline', protect, timeline);

module.exports = router;

