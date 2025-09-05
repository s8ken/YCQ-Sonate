const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getSnowflakeStatus,
  connectToSnowflake,
  disconnectFromSnowflake,
  executeQuery,
  syncToWeaviate,
  queryWithContext,
  getTableSchema,
  listTables,
  testIntegration
} = require('../controllers/snowflake.controller');

// Snowflake connection management
router.get('/status', protect, getSnowflakeStatus);
router.post('/connect', protect, connectToSnowflake);
router.post('/disconnect', protect, disconnectFromSnowflake);

// Data querying
router.post('/query', protect, executeQuery);
router.post('/query-context', protect, queryWithContext);

// Schema and metadata
router.get('/tables', protect, listTables);
router.get('/schema/:tableName', protect, getTableSchema);

// Weaviate integration
router.post('/sync-to-weaviate', protect, syncToWeaviate);

// Testing
router.get('/test-integration', protect, testIntegration);

module.exports = router;