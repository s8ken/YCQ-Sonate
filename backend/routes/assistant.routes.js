const express = require('express');
const router = express.Router();
const assistantController = require('../controllers/assistant.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Apply authentication middleware to all assistant routes
router.use(authMiddleware.protect);

// Assistant management routes
router.post('/create', assistantController.createAssistant);
router.get('/list', assistantController.listAssistants);
router.get('/latest', assistantController.getLatest);
router.put('/:assistantId', assistantController.updateAssistant);
router.delete('/:assistantId', assistantController.deleteAssistant);

// Thread management routes
router.post('/thread/create', assistantController.createThread);
router.get('/thread/:threadId/messages', assistantController.getThreadMessages);

// Conversation routes
router.post('/message', assistantController.sendMessage);

// Utility routes
router.get('/functions', assistantController.getFunctionDefinitions);
router.get('/test', assistantController.testIntegration);

module.exports = router;
