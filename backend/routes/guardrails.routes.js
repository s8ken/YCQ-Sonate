const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { applyGuardrails } = require('../controllers/guardrails.controller');

router.post('/apply', protect, applyGuardrails);

module.exports = router;

