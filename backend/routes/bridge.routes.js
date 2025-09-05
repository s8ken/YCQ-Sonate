const express = require('express');
const router = express.Router();
const { orchestrate, dispatchChosen } = require('../controllers/bridge.controller');
const { protect } = require('../middleware/auth.middleware');

// Require authentication for all bridge routes
router.use(protect);

router.post('/orchestrate', orchestrate);
router.post('/dispatch', dispatchChosen);

module.exports = router;

