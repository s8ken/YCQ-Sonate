const express = require('express');
const router = express.Router();
const { get, put } = require('../controllers/capsule.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/:sessionId', get);
router.put('/:sessionId', put);

module.exports = router;

