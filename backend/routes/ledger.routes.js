const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { getLedger, verify } = require('../controllers/ledger.controller');

router.get('/', protect, getLedger);
router.get('/verify', protect, verify);

module.exports = router;
