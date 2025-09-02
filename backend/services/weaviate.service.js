const weaviate = require('weaviate-ts-client');
const { v4: uuidv4 } = require('uuid');

class WeaviateService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.contextClassName = 'SymbiContext';
    this.config = this.loadConfig();
  }

  loadConfig() {
    const weaviateUrl = process.env.WEAVIATE_URL || 'http://localhost:8080';
    const url = new URL(weaviateUrl);
    
    const config = {
      scheme: url.protocol.replace(':', ''),
      host: url.host,
      timeout: parseInt(process.env.WEAVIATE_TIMEOUT) || 30000,
      startupPeriod: parseInt(process.env.WEAVIATE_STARTUP_PERIOD) || 5000
    };

    // Add API key if provided
    if (process.env.WEAVIATE_API_KEY) {
      config.apiKey = new weaviate.ApiKey(process.env.WEAVIATE_API_KEY);
    }

    // Add additional headers if provided
    if (process.env.WEAVIATE_ADDITIONAL_HEADERS) {
      try {
        config.headers = JSON.parse(process.env.WEAVIATE_ADDITIONAL_HEADERS);
      } catch (error) {
        console.warn('Invalid WEAVIATE_ADDITIONAL_HEADERS format, ignoring:', error.message);
      }
    }

    // Add OpenAI API key for vectorization if available
    if (process.env.OPENAI_API_KEY) {
      config.headers = {
        ...config.headers,
        'X-OpenAI-Api-Key': process.env.OPENAI_API_KEY
      };
    }

    return config;
  }

  /**
   * Initialize Weaviate client connection
   */
  async initialize() {
    try {
      // Configure Weaviate client with environment variables
      this.client = weaviate.client(this.config);

      // Test connection with timeout
      const connectionTimeout = setTimeout(() => {
        throw new Error(`Connection timeout after ${this.config.timeout}ms`);
      }, this.config.timeout);

      await this.client.misc.metaGetter().do();
      clearTimeout(connectionTimeout);
      
      this.isConnected = true;
      console.log(`✅ Weaviate service initialized at ${this.config.scheme}://${this.config.host}`);

      // Initialize schema if it doesn't exist
      await this.initializeSchema();
    } catch (error) {
      console.error('❌ Failed to initialize Weaviate service:', error.message);
      console.log(`Attempted connection to: ${this.config.scheme}://${this.config.host}`);
      this.isConnected = false;
      
      // Retry connection after startup period
      if (process.env.NODE_ENV !== 'test') {
        setTimeout(() => {
          console.log('🔄 Retrying Weaviate connection...');
          this.initialize();
        }, this.config.startupPeriod);
      }
      
      throw error;
    }
  }

  /**
   * Initialize the context schema in Weaviate
   */
  async initializeSchema() {
    try {
      // Check if class already exists
      const existingClasses = await this.client.schema.getter().do();
      const classExists = existingClasses.classes?.some(
        cls => cls.class === this.contextClassName
      );

      if (classExists) {
        console.log(`Schema ${this.contextClassName} already exists`);
        return;
      }

      // Define the context schema
      const contextClass = {
        class: this.contextClassName,
        description: 'Context data for Symbi Trust Protocol',
        vectorizer: 'text2vec-openai',
        moduleConfig: {
          'text2vec-openai': {
            model: 'ada',
            modelVersion: '002',
            type: 'text',
            baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com'
          }
        },
        properties: [
          {
            name: 'tag',
            dataType: ['text'],
            description: 'Context tag identifier',
            indexFilterable: true,
            indexSearchable: true
          },
          {
            name: 'source',
            dataType: ['text'],
            description: 'Context source system (symbi, overseer, system)',
            indexFilterable: true
          },
          {
            name: 'content',
            dataType: ['text'],
            description: 'Main context content for vectorization',
            indexSearchable: true
          },
          {
            name: 'data',
            dataType: ['text'],
            description: 'JSON stringified context data'
          },
          {
            name: 'trustScore',
            dataType: ['number'],
            description: 'Trust score from 0 to 5'
          },
          {
            name: 'mongoId',
            dataType: ['text'],
            description: 'Reference to MongoDB document ID',
            indexFilterable: true
          },
          {
            name: 'conversationId',
            dataType: ['text'],
            description: 'Related conversation ID',
            indexFilterable: true
          },
          {
            name: 'agentId',
            dataType: ['text'],
            description: 'Related agent ID',
            indexFilterable: true
          },
          {
            name: 'createdAt',
            dataType: ['date'],
            description: 'Creation timestamp'
          },
          {
            name: 'isActive',
            dataType: ['boolean'],
            description: 'Whether context is active'
          }
        ]
      };

      await this.client.schema.classCreator().withClass(contextClass).do();
      console.log(`✅ Created Weaviate schema: ${this.contextClassName}`);
    } catch (error) {
      console.error('❌ Failed to initialize schema:', error.message);
      throw error;
    }
  }

  /**
   * Store context in Weaviate with vector embedding
   */
  async storeContext(contextData) {
    if (!this.isConnected) {
      throw new Error('Weaviate service not initialized');
    }

    try {
      const { _id, tag, source, data, trustScore, relatedTo, createdAt, isActive } = contextData;
      
      // Create content for vectorization by combining relevant text fields
      const content = this.createVectorizableContent(tag, data);

      const weaviateObject = {
        class: this.contextClassName,
        properties: {
          tag,
          source,
          content,
          data: JSON.stringify(data),
          trustScore: trustScore || 5,
          mongoId: _id.toString(),
          conversationId: relatedTo?.conversation?.toString() || null,
          agentId: relatedTo?.agent?.toString() || null,
          createdAt: createdAt || new Date().toISOString(),
          isActive: isActive !== false
        },
        id: uuidv4()
      };

      const result = await this.client.data
        .creator()
        .withClassName(this.contextClassName)
        .withProperties(weaviateObject.properties)
        .withId(weaviateObject.id)
        .do();

      console.log(`✅ Stored context in Weaviate: ${tag}`);
      return { weaviateId: result.id, ...weaviateObject };
    } catch (error) {
      console.error('❌ Failed to store context in Weaviate:', error.message);
      throw error;
    }
  }

  /**
   * Perform semantic search for contexts
   */
  async searchContexts(query, options = {}) {
    if (!this.isConnected) {
      throw new Error('Weaviate service not initialized');
    }

    try {
      const {
        limit = parseInt(process.env.DEFAULT_SEARCH_LIMIT) || 10,
        source = null,
        minTrustScore = parseFloat(process.env.MIN_TRUST_SCORE) || 0,
        activeOnly = true,
        certainty = parseFloat(process.env.DEFAULT_SIMILARITY_THRESHOLD) || 0.7
      } = options;

      const maxResults = Math.min(limit, parseInt(process.env.MAX_SEARCH_RESULTS) || 100);

      let searchQuery = this.client.graphql
        .get()
        .withClassName(this.contextClassName)
        .withFields('tag source content data trustScore mongoId conversationId agentId createdAt isActive')
        .withNearText({ concepts: [query] })
        .withLimit(maxResults)
        .withWhere({
          operator: 'And',
          operands: [
            ...(source ? [{
              path: ['source'],
              operator: 'Equal',
              valueText: source
            }] : []),
            {
              path: ['trustScore'],
              operator: 'GreaterThanEqual',
              valueNumber: minTrustScore
            },
            ...(activeOnly ? [{
              path: ['isActive'],
              operator: 'Equal',
              valueBoolean: true
            }] : [])
          ].filter(operand => operand)
        });

      if (certainty > 0) {
        searchQuery = searchQuery.withCertainty(certainty);
      }

      const result = await searchQuery.do();
      
      const contexts = result.data?.Get?.[this.contextClassName] || [];
      console.log(`🔍 Found ${contexts.length} contexts for query: "${query}"`);
      
      return contexts.map(context => ({
        ...context,
        data: JSON.parse(context.data)
      }));
    } catch (error) {
      console.error('❌ Failed to search contexts:', error.message);
      throw error;
    }
  }

  /**
   * Find similar contexts to a given context
   */
  async findSimilarContexts(contextId, limit = 5) {
    if (!this.isConnected) {
      throw new Error('Weaviate service not initialized');
    }

    try {
      const result = await this.client.graphql
        .get()
        .withClassName(this.contextClassName)
        .withFields('tag source content data trustScore mongoId conversationId agentId createdAt')
        .withNearObject({ id: contextId })
        .withLimit(limit)
        .withWhere({
          path: ['isActive'],
          operator: 'Equal',
          valueBoolean: true
        })
        .do();

      const contexts = result.data?.Get?.[this.contextClassName] || [];
      return contexts.map(context => ({
        ...context,
        data: JSON.parse(context.data)
      }));
    } catch (error) {
      console.error('❌ Failed to find similar contexts:', error.message);
      throw error;
    }
  }

  /**
   * Update context in Weaviate
   */
  async updateContext(weaviateId, updates) {
    if (!this.isConnected) {
      throw new Error('Weaviate service not initialized');
    }

    try {
      const updateProperties = {};
      
      if (updates.data) {
        updateProperties.content = this.createVectorizableContent(updates.tag, updates.data);
        updateProperties.data = JSON.stringify(updates.data);
      }
      
      if (updates.trustScore !== undefined) {
        updateProperties.trustScore = updates.trustScore;
      }
      
      if (updates.isActive !== undefined) {
        updateProperties.isActive = updates.isActive;
      }

      await this.client.data
        .updater()
        .withClassName(this.contextClassName)
        .withId(weaviateId)
        .withProperties(updateProperties)
        .do();

      console.log(`✅ Updated context in Weaviate: ${weaviateId}`);
    } catch (error) {
      console.error('❌ Failed to update context in Weaviate:', error.message);
      throw error;
    }
  }

  /**
   * Delete context from Weaviate
   */
  async deleteContext(weaviateId) {
    if (!this.isConnected) {
      throw new Error('Weaviate service not initialized');
    }

    try {
      await this.client.data
        .deleter()
        .withClassName(this.contextClassName)
        .withId(weaviateId)
        .do();

      console.log(`✅ Deleted context from Weaviate: ${weaviateId}`);
    } catch (error) {
      console.error('❌ Failed to delete context from Weaviate:', error.message);
      throw error;
    }
  }

  /**
   * Get context bridge recommendations based on semantic similarity
   */
  async getBridgeRecommendations(sourceTag, limit = 5) {
    if (!this.isConnected) {
      throw new Error('Weaviate service not initialized');
    }

    try {
      // First, find the source context
      const sourceResult = await this.client.graphql
        .get()
        .withClassName(this.contextClassName)
        .withFields('content')
        .withWhere({
          path: ['tag'],
          operator: 'Equal',
          valueText: sourceTag
        })
        .withLimit(1)
        .do();

      const sourceContexts = sourceResult.data?.Get?.[this.contextClassName] || [];
      if (sourceContexts.length === 0) {
        return [];
      }

      // Find semantically similar contexts from different sources
      const recommendations = await this.client.graphql
        .get()
        .withClassName(this.contextClassName)
        .withFields('tag source content data trustScore mongoId')
        .withNearText({ concepts: [sourceContexts[0].content] })
        .withLimit(limit * 2) // Get more to filter out same source
        .withWhere({
          operator: 'And',
          operands: [
            {
              path: ['isActive'],
              operator: 'Equal',
              valueBoolean: true
            },
            {
              path: ['tag'],
              operator: 'NotEqual',
              valueText: sourceTag
            }
          ]
        })
        .do();

      const contexts = recommendations.data?.Get?.[this.contextClassName] || [];
      
      // Filter to get contexts from different sources and limit results
      const filtered = contexts
        .map(context => ({
          ...context,
          data: JSON.parse(context.data)
        }))
        .slice(0, limit);

      console.log(`🔗 Found ${filtered.length} bridge recommendations for: ${sourceTag}`);
      return filtered;
    } catch (error) {
      console.error('❌ Failed to get bridge recommendations:', error.message);
      throw error;
    }
  }

  /**
   * Create vectorizable content from context data
   */
  createVectorizableContent(tag, data) {
    let content = tag;
    
    if (typeof data === 'object' && data !== null) {
      // Extract meaningful text from data object
      const textFields = [];
      
      const extractText = (obj, prefix = '') => {
        for (const [key, value] of Object.entries(obj)) {
          if (typeof value === 'string' && value.length > 0) {
            textFields.push(value);
          } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            extractText(value, `${prefix}${key}.`);
          }
        }
      };
      
      extractText(data);
      
      if (textFields.length > 0) {
        content += ' ' + textFields.join(' ');
      }
    } else if (typeof data === 'string') {
      content += ' ' + data;
    }
    
    return content.trim();
  }

  /**
   * Get service health status
   */
  async getHealthStatus() {
    try {
      if (!this.isConnected) {
        return { status: 'disconnected', message: 'Service not initialized' };
      }

      const meta = await this.client.misc.metaGetter().do();
      return {
        status: 'healthy',
        version: meta.version,
        hostname: meta.hostname,
        connected: true
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        connected: false
      };
    }
  }
}

// Export singleton instance
const weaviateService = new WeaviateService();
module.exports = weaviateService;