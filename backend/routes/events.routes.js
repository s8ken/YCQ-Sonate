const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { ingestEvent, getLedger } = require('../controllers/ledger.controller');

router.post('/', protect, ingestEvent);
router.get('/ledger', protect, getLedger);

module.exports = router;

