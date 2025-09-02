const snowflake = require('snowflake-sdk');
const weaviateService = require('./weaviate.service');

class SnowflakeService {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.config = {
      account: process.env.SNOWFLAKE_ACCOUNT || 'PNHTPQU-LU03113',
      username: process.env.SNOWFLAKE_USERNAME || 'SAITKEN',
      password: process.env.SNOWFLAKE_PASSWORD,
      database: process.env.SNOWFLAKE_DATABASE,
      schema: process.env.SNOWFLAKE_SCHEMA || 'PUBLIC',
      warehouse: process.env.SNOWFLAKE_WAREHOUSE,
      role: process.env.SNOWFLAKE_ROLE || 'ACCOUNTADMIN',
      timeout: parseInt(process.env.SNOWFLAKE_TIMEOUT) || 60000,
      clientSessionKeepAlive: true,
      clientSessionKeepAliveHeartbeatFrequency: 3600
    };
  }

  /**
   * Initialize connection to Snowflake
   */
  async connect() {
    try {
      if (this.isConnected && this.connection) {
        return { success: true, message: 'Already connected to Snowflake' };
      }

      // Validate required configuration
      if (!this.config.password) {
        throw new Error('SNOWFLAKE_PASSWORD environment variable is required');
      }
      if (!this.config.database) {
        throw new Error('SNOWFLAKE_DATABASE environment variable is required');
      }
      if (!this.config.warehouse) {
        throw new Error('SNOWFLAKE_WAREHOUSE environment variable is required');
      }

      this.connection = snowflake.createConnection(this.config);

      return new Promise((resolve, reject) => {
        this.connection.connect((err, conn) => {
          if (err) {
            console.error('Failed to connect to Snowflake:', err.message);
            this.isConnected = false;
            reject(new Error(`Snowflake connection failed: ${err.message}`));
          } else {
            console.log('Successfully connected to Snowflake');
            this.isConnected = true;
            resolve({ 
              success: true, 
              message: 'Connected to Snowflake successfully',
              account: this.config.account,
              database: this.config.database,
              warehouse: this.config.warehouse
            });
          }
        });
      });
    } catch (error) {
      console.error('Snowflake connection error:', error.message);
      throw error;
    }
  }

  /**
   * Disconnect from Snowflake
   */
  async disconnect() {
    try {
      if (this.connection && this.isConnected) {
        await new Promise((resolve) => {
          this.connection.destroy((err) => {
            if (err) {
              console.error('Error disconnecting from Snowflake:', err.message);
            }
            resolve();
          });
        });
      }
      this.isConnected = false;
      this.connection = null;
      return { success: true, message: 'Disconnected from Snowflake' };
    } catch (error) {
      console.error('Snowflake disconnection error:', error.message);
      throw error;
    }
  }

  /**
   * Execute a SQL query
   */
  async executeQuery(sqlText, binds = []) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      return new Promise((resolve, reject) => {
        this.connection.execute({
          sqlText,
          binds,
          complete: (err, stmt, rows) => {
            if (err) {
              console.error('Snowflake query error:', err.message);
              reject(new Error(`Query execution failed: ${err.message}`));
            } else {
              resolve({
                success: true,
                rows: rows || [],
                rowCount: rows ? rows.length : 0,
                statement: stmt
              });
            }
          }
        });
      });
    } catch (error) {
      console.error('Snowflake query execution error:', error.message);
      throw error;
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      connected: this.isConnected,
      account: this.config.account,
      database: this.config.database,
      warehouse: this.config.warehouse,
      schema: this.config.schema,
      role: this.config.role
    };
  }

  /**
   * Sync data from Snowflake to Weaviate for context bridging
   */
  async syncDataToWeaviate(options = {}) {
    try {
      const {
        table = 'CONTEXT_DATA',
        limit = 1000,
        whereClause = '',
        vectorizeFields = ['CONTENT', 'DESCRIPTION', 'METADATA']
      } = options;

      // Build the query
      let query = `SELECT * FROM ${this.config.database}.${this.config.schema}.${table}`;
      if (whereClause) {
        query += ` WHERE ${whereClause}`;
      }
      query += ` LIMIT ${limit}`;

      console.log('Executing Snowflake query:', query);
      const result = await this.executeQuery(query);

      if (!result.success || !result.rows.length) {
        return {
          success: true,
          message: 'No data found to sync',
          syncedCount: 0
        };
      }

      // Process and vectorize data
      const syncedContexts = [];
      for (const row of result.rows) {
        try {
          // Create context object for Weaviate
          const contextData = {
            tag: row.TAG || 'snowflake-data',
            source: 'snowflake',
            content: this.buildContentString(row, vectorizeFields),
            data: row,
            trustScore: row.TRUST_SCORE || 3.0,
            conversationId: row.CONVERSATION_ID || 'snowflake-sync',
            agentId: row.AGENT_ID || 'snowflake-agent',
            isActive: row.IS_ACTIVE !== false,
            metadata: {
              snowflakeTable: table,
              syncedAt: new Date().toISOString(),
              originalId: row.ID || row._ID
            }
          };

          // Store in Weaviate
          const weaviateResult = await weaviateService.storeContext(contextData);
          if (weaviateResult.success) {
            syncedContexts.push({
              originalId: contextData.metadata.originalId,
              weaviateId: weaviateResult.id,
              tag: contextData.tag
            });
          }
        } catch (error) {
          console.error('Error syncing row to Weaviate:', error.message);
        }
      }

      return {
        success: true,
        message: `Successfully synced ${syncedContexts.length} records from Snowflake to Weaviate`,
        totalRows: result.rowCount,
        syncedCount: syncedContexts.length,
        syncedContexts
      };
    } catch (error) {
      console.error('Snowflake to Weaviate sync error:', error.message);
      throw error;
    }
  }

  /**
   * Build content string for vectorization
   */
  buildContentString(row, vectorizeFields) {
    const contentParts = [];
    
    for (const field of vectorizeFields) {
      if (row[field] && typeof row[field] === 'string') {
        contentParts.push(row[field]);
      } else if (row[field] && typeof row[field] === 'object') {
        contentParts.push(JSON.stringify(row[field]));
      }
    }
    
    // Fallback to all string fields if no specific fields found
    if (contentParts.length === 0) {
      for (const [key, value] of Object.entries(row)) {
        if (typeof value === 'string' && value.length > 10) {
          contentParts.push(`${key}: ${value}`);
        }
      }
    }
    
    return contentParts.join(' | ');
  }

  /**
   * Query Snowflake data with semantic search context
   */
  async queryWithContext(searchQuery, options = {}) {
    try {
      const {
        table = 'CONTEXT_DATA',
        limit = 50,
        similarityThreshold = 0.7
      } = options;

      // First, get similar contexts from Weaviate
      const weaviateResults = await weaviateService.searchSimilarContexts(searchQuery, {
        limit,
        threshold: similarityThreshold
      });

      if (!weaviateResults.success || !weaviateResults.contexts.length) {
        return {
          success: true,
          message: 'No similar contexts found',
          results: []
        };
      }

      // Extract Snowflake IDs from Weaviate results
      const snowflakeIds = weaviateResults.contexts
        .filter(ctx => ctx.source === 'snowflake' && ctx.metadata?.originalId)
        .map(ctx => ctx.metadata.originalId);

      if (snowflakeIds.length === 0) {
        return {
          success: true,
          message: 'No Snowflake data found in similar contexts',
          results: []
        };
      }

      // Query Snowflake for the original data
      const idList = snowflakeIds.map(id => `'${id}'`).join(',');
      const query = `
        SELECT * FROM ${this.config.database}.${this.config.schema}.${table}
        WHERE ID IN (${idList})
        ORDER BY CREATED_AT DESC
      `;

      const result = await this.executeQuery(query);
      
      return {
        success: true,
        message: `Found ${result.rowCount} matching records`,
        results: result.rows,
        weaviateContexts: weaviateResults.contexts
      };
    } catch (error) {
      console.error('Snowflake context query error:', error.message);
      throw error;
    }
  }

  /**
   * Get table schema information
   */
  async getTableSchema(tableName) {
    try {
      const query = `
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
        FROM ${this.config.database}.INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = '${this.config.schema}'
        AND TABLE_NAME = '${tableName}'
        ORDER BY ORDINAL_POSITION
      `;

      const result = await this.executeQuery(query);
      return {
        success: true,
        schema: result.rows,
        tableName,
        columnCount: result.rowCount
      };
    } catch (error) {
      console.error('Schema query error:', error.message);
      throw error;
    }
  }

  /**
   * List available tables
   */
  async listTables() {
    try {
      const query = `
        SELECT TABLE_NAME, TABLE_TYPE, ROW_COUNT, BYTES
        FROM ${this.config.database}.INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = '${this.config.schema}'
        ORDER BY TABLE_NAME
      `;

      const result = await this.executeQuery(query);
      return {
        success: true,
        tables: result.rows,
        tableCount: result.rowCount
      };
    } catch (error) {
      console.error('List tables error:', error.message);
      throw error;
    }
  }
}

module.exports = new SnowflakeService();