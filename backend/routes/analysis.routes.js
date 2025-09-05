const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { analyzeTurn } = require('../controllers/analysis.controller');

router.post('/turn', protect, analyzeTurn);

module.exports = router;

