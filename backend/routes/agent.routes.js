const express = require('express');
const router = express.Router();
const { 
  getAllAgents,
  getPublicAgents, 
  getAgent, 
  createAgent, 
  updateAgent, 
  deleteAgent, 
  connectAgents,
  addExternalSystem,
  toggleExternalSystem,
  syncExternalSystem
} = require('../controllers/agent.controller');
const { protect } = require('../middleware/auth.middleware');

// Agent management routes
router.get('/', protect, getAllAgents);
router.get('/public', protect, getPublicAgents);
router.get('/:id', protect, getAgent);
router.post('/', protect, createAgent);
router.put('/:id', protect, updateAgent);
router.delete('/:id', protect, deleteAgent);

// Agent-to-agent communication
router.post('/connect', protect, connectAgents);

// External system integration routes
router.post('/:id/external-systems', protect, addExternalSystem);
router.put('/:id/external-systems/:systemName/toggle', protect, toggleExternalSystem);
router.post('/:id/external-systems/:systemName/sync', protect, syncExternalSystem);

module.exports = router;
