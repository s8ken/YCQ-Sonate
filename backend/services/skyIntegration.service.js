const axios = require('axios');
const Agent = require('../models/agent.model');

class SkyIntegrationService {
  constructor() {
    this.defaultTimeout = 10000; // 10 seconds
  }

  /**
   * Test connection to Sky project
   * @param {string} endpoint - Sky project endpoint URL
   * @param {string} apiKey - Optional API key for authentication
   * @returns {Promise<Object>} Connection test result
   */
  async testConnection(endpoint, apiKey = null) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Symbi-Synergy/1.0'
      };

      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const response = await axios.get(`${endpoint}/health`, {
        headers,
        timeout: this.defaultTimeout
      });

      return {
        success: true,
        status: response.status,
        message: 'Connection successful',
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        status: error.response?.status || 500,
        message: error.message || 'Connection failed',
        error: error.response?.data || null
      };
    }
  }

  /**
   * Send message to Sky project
   * @param {Object} system - External system configuration
   * @param {Object} message - Message to send
   * @param {string} agentId - ID of the sending agent
   * @returns {Promise<Object>} Response from Sky project
   */
  async sendMessage(system, message, agentId) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Symbi-Synergy/1.0',
        'X-Agent-ID': agentId
      };

      if (system.apiKey) {
        headers['Authorization'] = `Bearer ${system.apiKey}`;
      }

      const payload = {
        message: message.content,
        sender: message.sender,
        timestamp: message.timestamp || new Date().toISOString(),
        metadata: {
          agentId,
          systemName: system.name,
          ...message.metadata
        }
      };

      const response = await axios.post(`${system.endpoint}/api/messages`, payload, {
        headers,
        timeout: this.defaultTimeout
      });

      return {
        success: true,
        status: response.status,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        status: error.response?.status || 500,
        message: error.message || 'Failed to send message',
        error: error.response?.data || null,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Receive and process webhook from Sky project
   * @param {Object} payload - Webhook payload
   * @param {string} agentId - Target agent ID
   * @returns {Promise<Object>} Processing result
   */
  async processWebhook(payload, agentId) {
    try {
      const agent = await Agent.findById(agentId);
      if (!agent) {
        throw new Error('Agent not found');
      }

      // Find the Sky system configuration
      const skySystem = agent.externalSystems.find(
        sys => sys.type === 'sky-testbed' && sys.isActive
      );

      if (!skySystem) {
        throw new Error('No active Sky system found for this agent');
      }

      // Update sync timestamp
      await agent.updateExternalSystemSync(skySystem.name);

      // Process the webhook payload based on type
      const result = await this.processWebhookByType(payload, agent, skySystem);

      return {
        success: true,
        message: 'Webhook processed successfully',
        data: result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to process webhook',
        error: error.toString(),
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Process webhook based on payload type
   * @param {Object} payload - Webhook payload
   * @param {Object} agent - Agent document
   * @param {Object} system - Sky system configuration
   * @returns {Promise<Object>} Processing result
   */
  async processWebhookByType(payload, agent, system) {
    const { type, data } = payload;

    switch (type) {
      case 'message':
        return await this.handleMessageWebhook(data, agent, system);
      case 'status_update':
        return await this.handleStatusUpdateWebhook(data, agent, system);
      case 'test_result':
        return await this.handleTestResultWebhook(data, agent, system);
      default:
        return {
          type: 'unknown',
          message: `Unknown webhook type: ${type}`,
          data
        };
    }
  }

  /**
   * Handle message webhook from Sky project
   * @param {Object} data - Message data
   * @param {Object} agent - Agent document
   * @param {Object} system - Sky system configuration
   * @returns {Promise<Object>} Processing result
   */
  async handleMessageWebhook(data, agent, system) {
    // This would integrate with your conversation system
    // For now, we'll just log and return the data
    console.log(`Received message from Sky (${system.name}):`, data);
    
    return {
      type: 'message',
      processed: true,
      message: data.content,
      sender: data.sender || 'sky-system',
      timestamp: data.timestamp || new Date().toISOString()
    };
  }

  /**
   * Handle status update webhook from Sky project
   * @param {Object} data - Status data
   * @param {Object} agent - Agent document
   * @param {Object} system - Sky system configuration
   * @returns {Promise<Object>} Processing result
   */
  async handleStatusUpdateWebhook(data, agent, system) {
    console.log(`Received status update from Sky (${system.name}):`, data);
    
    return {
      type: 'status_update',
      processed: true,
      status: data.status,
      details: data.details || {},
      timestamp: data.timestamp || new Date().toISOString()
    };
  }

  /**
   * Handle test result webhook from Sky project
   * @param {Object} data - Test result data
   * @param {Object} agent - Agent document
   * @param {Object} system - Sky system configuration
   * @returns {Promise<Object>} Processing result
   */
  async handleTestResultWebhook(data, agent, system) {
    console.log(`Received test result from Sky (${system.name}):`, data);
    
    return {
      type: 'test_result',
      processed: true,
      testId: data.testId,
      result: data.result,
      score: data.score || null,
      details: data.details || {},
      timestamp: data.timestamp || new Date().toISOString()
    };
  }

  /**
   * Get Sky project status
   * @param {Object} system - External system configuration
   * @returns {Promise<Object>} Status information
   */
  async getStatus(system) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Symbi-Synergy/1.0'
      };

      if (system.apiKey) {
        headers['Authorization'] = `Bearer ${system.apiKey}`;
      }

      const response = await axios.get(`${system.endpoint}/api/status`, {
        headers,
        timeout: this.defaultTimeout
      });

      return {
        success: true,
        status: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to get status',
        error: error.response?.data || null,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = new SkyIntegrationService();