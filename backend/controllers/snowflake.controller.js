const snowflakeService = require('../services/snowflake.service');
const weaviateService = require('../services/weaviate.service');

/**
 * Get Snowflake connection status
 */
const getSnowflakeStatus = async (req, res) => {
  try {
    const status = snowflakeService.getStatus();
    
    res.json({
      success: true,
      status,
      message: status.connected ? 'Connected to Snowflake' : 'Not connected to Snowflake'
    });
  } catch (error) {
    console.error('Get Snowflake status error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to get Snowflake status'
    });
  }
};

/**
 * Connect to Snowflake
 */
const connectToSnowflake = async (req, res) => {
  try {
    const result = await snowflakeService.connect();
    
    res.json({
      success: true,
      message: result.message,
      account: result.account,
      database: result.database,
      warehouse: result.warehouse
    });
  } catch (error) {
    console.error('Snowflake connection error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Connection Failed',
      message: error.message
    });
  }
};

/**
 * Disconnect from Snowflake
 */
const disconnectFromSnowflake = async (req, res) => {
  try {
    const result = await snowflakeService.disconnect();
    
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Snowflake disconnection error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Disconnection Failed',
      message: error.message
    });
  }
};

/**
 * Execute a custom SQL query
 */
const executeQuery = async (req, res) => {
  try {
    const { query, binds = [] } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'SQL query is required'
      });
    }
    
    // Security check - prevent dangerous operations
    const dangerousKeywords = ['DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'CREATE', 'INSERT', 'UPDATE'];
    const upperQuery = query.toUpperCase();
    
    for (const keyword of dangerousKeywords) {
      if (upperQuery.includes(keyword)) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: `Query contains forbidden keyword: ${keyword}. Only SELECT queries are allowed.`
        });
      }
    }
    
    const result = await snowflakeService.executeQuery(query, binds);
    
    res.json({
      success: true,
      data: result.rows,
      rowCount: result.rowCount,
      message: `Query executed successfully. ${result.rowCount} rows returned.`
    });
  } catch (error) {
    console.error('Query execution error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Query Execution Failed',
      message: error.message
    });
  }
};

/**
 * Sync Snowflake data to Weaviate
 */
const syncToWeaviate = async (req, res) => {
  try {
    const {
      table = 'CONTEXT_DATA',
      limit = 1000,
      whereClause = '',
      vectorizeFields = ['CONTENT', 'DESCRIPTION', 'METADATA']
    } = req.body;
    
    const result = await snowflakeService.syncDataToWeaviate({
      table,
      limit,
      whereClause,
      vectorizeFields
    });
    
    res.json({
      success: true,
      message: result.message,
      totalRows: result.totalRows,
      syncedCount: result.syncedCount,
      syncedContexts: result.syncedContexts
    });
  } catch (error) {
    console.error('Snowflake to Weaviate sync error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Sync Failed',
      message: error.message
    });
  }
};

/**
 * Query Snowflake with semantic search context
 */
const queryWithContext = async (req, res) => {
  try {
    const {
      searchQuery,
      table = 'CONTEXT_DATA',
      limit = 50,
      similarityThreshold = 0.7
    } = req.body;
    
    if (!searchQuery || typeof searchQuery !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Search query is required'
      });
    }
    
    const result = await snowflakeService.queryWithContext(searchQuery, {
      table,
      limit,
      similarityThreshold
    });
    
    res.json({
      success: true,
      message: result.message,
      results: result.results,
      weaviateContexts: result.weaviateContexts,
      resultCount: result.results ? result.results.length : 0
    });
  } catch (error) {
    console.error('Context query error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Context Query Failed',
      message: error.message
    });
  }
};

/**
 * Get table schema
 */
const getTableSchema = async (req, res) => {
  try {
    const { tableName } = req.params;
    
    if (!tableName) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Table name is required'
      });
    }
    
    const result = await snowflakeService.getTableSchema(tableName);
    
    res.json({
      success: true,
      tableName: result.tableName,
      schema: result.schema,
      columnCount: result.columnCount
    });
  } catch (error) {
    console.error('Get table schema error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Schema Query Failed',
      message: error.message
    });
  }
};

/**
 * List available tables
 */
const listTables = async (req, res) => {
  try {
    const result = await snowflakeService.listTables();
    
    res.json({
      success: true,
      tables: result.tables,
      tableCount: result.tableCount
    });
  } catch (error) {
    console.error('List tables error:', error.message);
    res.status(500).json({
      success: false,
      error: 'List Tables Failed',
      message: error.message
    });
  }
};

/**
 * Test Snowflake and Weaviate integration
 */
const testIntegration = async (req, res) => {
  try {
    const results = {
      snowflake: { connected: false, error: null },
      weaviate: { connected: false, error: null },
      integration: { working: false, error: null }
    };
    
    // Test Snowflake connection
    try {
      await snowflakeService.connect();
      results.snowflake.connected = true;
    } catch (error) {
      results.snowflake.error = error.message;
    }
    
    // Test Weaviate connection
    try {
      const weaviateStatus = await weaviateService.checkConnection();
      results.weaviate.connected = weaviateStatus.connected;
      if (!weaviateStatus.connected) {
        results.weaviate.error = 'Weaviate not connected';
      }
    } catch (error) {
      results.weaviate.error = error.message;
    }
    
    // Test integration if both are connected
    if (results.snowflake.connected && results.weaviate.connected) {
      try {
        // Try a simple test query
        const testResult = await snowflakeService.executeQuery(
          'SELECT 1 as TEST_VALUE, CURRENT_TIMESTAMP() as TEST_TIME'
        );
        results.integration.working = testResult.success;
      } catch (error) {
        results.integration.error = error.message;
      }
    } else {
      results.integration.error = 'Both Snowflake and Weaviate must be connected';
    }
    
    const allWorking = results.snowflake.connected && 
                      results.weaviate.connected && 
                      results.integration.working;
    
    res.json({
      success: true,
      allWorking,
      results,
      message: allWorking 
        ? 'All integrations are working correctly' 
        : 'Some integrations have issues'
    });
  } catch (error) {
    console.error('Integration test error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Integration Test Failed',
      message: error.message
    });
  }
};

module.exports = {
  getSnowflakeStatus,
  connectToSnowflake,
  disconnectFromSnowflake,
  executeQuery,
  syncToWeaviate,
  queryWithContext,
  getTableSchema,
  listTables,
  testIntegration
};