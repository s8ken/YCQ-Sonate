const assistantService = require('../services/assistant.service');
const User = require('../models/user.model');

class AssistantController {
  // Create a new OpenAI Assistant
  async createAssistant(req, res) {
    try {
      const { name, instructions, model } = req.body;
      const userId = req.user.id;
      
      // Get user's OpenAI API key
      const user = await User.findById(userId);
      const openaiKey = user.apiKeys?.find(key => key.provider === 'openai')?.key;
      
      if (!openaiKey) {
        return res.status(400).json({
          error: 'OpenAI API key not found. Please add your OpenAI API key in settings.'
        });
      }
      
      const config = {
        name: name || `${user.name}'s Symbi Assistant`,
        instructions,
        model: model || 'gpt-4-1106-preview'
      };
      
      const assistant = await assistantService.createAssistant(openaiKey, config);
      
      res.json({
        success: true,
        assistant,
        message: 'Assistant created successfully'
      });
      
    } catch (error) {
      console.error('Error creating assistant:', error);
      res.status(500).json({
        error: 'Failed to create assistant',
        details: error.message
      });
    }
  }
  
  // List user's assistants
  async listAssistants(req, res) {
    try {
      const userId = req.user.id;
      
      const user = await User.findById(userId);
      const openaiKey = user.apiKeys?.find(key => key.provider === 'openai')?.key;
      
      if (!openaiKey) {
        return res.status(400).json({
          error: 'OpenAI API key not found. Please add your OpenAI API key in settings.'
        });
      }
      
      const assistants = await assistantService.listAssistants(openaiKey);
      
      res.json({
        success: true,
        assistants,
        count: assistants.length
      });
      
    } catch (error) {
      console.error('Error listing assistants:', error);
      res.status(500).json({
        error: 'Failed to list assistants',
        details: error.message
      });
    }
  }
  
  // Delete an assistant
  async deleteAssistant(req, res) {
    try {
      const { assistantId } = req.params;
      const userId = req.user.id;
      
      const user = await User.findById(userId);
      const openaiKey = user.apiKeys?.find(key => key.provider === 'openai')?.key;
      
      if (!openaiKey) {
        return res.status(400).json({
          error: 'OpenAI API key not found. Please add your OpenAI API key in settings.'
        });
      }
      
      const result = await assistantService.deleteAssistant(openaiKey, assistantId);
      
      res.json({
        success: true,
        result,
        message: 'Assistant deleted successfully'
      });
      
    } catch (error) {
      console.error('Error deleting assistant:', error);
      res.status(500).json({
        error: 'Failed to delete assistant',
        details: error.message
      });
    }
  }
  
  // Create a new conversation thread
  async createThread(req, res) {
    try {
      const userId = req.user.id;
      
      const user = await User.findById(userId);
      const openaiKey = user.apiKeys?.find(key => key.provider === 'openai')?.key;
      
      if (!openaiKey) {
        return res.status(400).json({
          error: 'OpenAI API key not found. Please add your OpenAI API key in settings.'
        });
      }
      
      const thread = await assistantService.createThread(openaiKey);
      
      res.json({
        success: true,
        thread: {
          id: thread.id,
          created_at: thread.created_at
        },
        message: 'Thread created successfully'
      });
      
    } catch (error) {
      console.error('Error creating thread:', error);
      res.status(500).json({
        error: 'Failed to create thread',
        details: error.message
      });
    }
  }
  
  // Send message to assistant
  async sendMessage(req, res) {
    try {
      const { threadId, assistantId, message } = req.body;
      const userId = req.user.id;
      
      if (!threadId || !assistantId || !message) {
        return res.status(400).json({
          error: 'threadId, assistantId, and message are required'
        });
      }
      
      const user = await User.findById(userId);
      const openaiKey = user.apiKeys?.find(key => key.provider === 'openai')?.key;
      
      if (!openaiKey) {
        return res.status(400).json({
          error: 'OpenAI API key not found. Please add your OpenAI API key in settings.'
        });
      }
      
      const result = await assistantService.sendMessage(
        openaiKey,
        threadId,
        assistantId,
        message,
        userId
      );
      
      res.json({
        success: true,
        result,
        message: 'Message sent successfully'
      });
      
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({
        error: 'Failed to send message',
        details: error.message
      });
    }
  }
  
  // Get thread messages
  async getThreadMessages(req, res) {
    try {
      const { threadId } = req.params;
      const userId = req.user.id;
      
      const user = await User.findById(userId);
      const openaiKey = user.apiKeys?.find(key => key.provider === 'openai')?.key;
      
      if (!openaiKey) {
        return res.status(400).json({
          error: 'OpenAI API key not found. Please add your OpenAI API key in settings.'
        });
      }
      
      const messages = await assistantService.getThreadMessages(openaiKey, threadId);
      
      res.json({
        success: true,
        messages,
        count: messages.length
      });
      
    } catch (error) {
      console.error('Error getting thread messages:', error);
      res.status(500).json({
        error: 'Failed to get thread messages',
        details: error.message
      });
    }
  }
  
  // Get available function definitions (for frontend reference)
  async getFunctionDefinitions(req, res) {
    try {
      const functions = assistantService.getFunctionDefinitions();
      
      res.json({
        success: true,
        functions,
        count: functions.length,
        description: 'Available functions that the assistant can call to access your app data'
      });
      
    } catch (error) {
      console.error('Error getting function definitions:', error);
      res.status(500).json({
        error: 'Failed to get function definitions',
        details: error.message
      });
    }
  }
  
  // Test assistant integration (development endpoint)
  async testIntegration(req, res) {
    try {
      const userId = req.user.id;
      
      const user = await User.findById(userId);
      const openaiKey = user.apiKeys?.find(key => key.provider === 'openai')?.key;
      
      if (!openaiKey) {
        return res.status(400).json({
          error: 'OpenAI API key not found. Please add your OpenAI API key in settings.'
        });
      }
      
      // Test basic OpenAI connection
      assistantService.initializeClient(openaiKey);
      
      // Get function definitions
      const functions = assistantService.getFunctionDefinitions();
      
      // Test a simple function call
      const userProfile = await assistantService.executeFunction('get_user_profile', {}, userId);
      
      res.json({
        success: true,
        message: 'Assistant integration test successful',
        data: {
          openaiConnected: true,
          functionsAvailable: functions.length,
          testFunctionResult: userProfile
        }
      });
      
    } catch (error) {
      console.error('Error testing assistant integration:', error);
      res.status(500).json({
        error: 'Assistant integration test failed',
        details: error.message
      });
    }
  }
}

module.exports = new AssistantController();
