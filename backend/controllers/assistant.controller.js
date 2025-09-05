const assistantService = require('../services/assistant.service');
const User = require('../models/user.model');

class AssistantController {
  // Create a new OpenAI Assistant
  async createAssistant(req, res) {
    try {
      const { name, instructions, model, tools } = req.body;
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
        model: model || 'gpt-4o',
        tools
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
  
  // Get the most recently created assistant
  async getLatest(req, res) {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);
      const openaiKey = user.apiKeys?.find(key => key.provider === 'openai')?.key;
      if (!openaiKey) {
        return res.status(400).json({
          error: 'OpenAI API key not found. Please add your OpenAI API key in settings.'
        });
      }

      const latest = await assistantService.getLatestAssistant(openaiKey);
      if (!latest) {
        return res.status(404).json({ error: 'No assistants found' });
      }
      res.json({ success: true, assistant: latest });
    } catch (error) {
      console.error('Error getting latest assistant:', error);
      res.status(500).json({ error: 'Failed to get latest assistant', details: error.message });
    }
  }

  // Update assistant
  async updateAssistant(req, res) {
    try {
      const { assistantId } = req.params;
      const { name, instructions, model, tools } = req.body;
      const userId = req.user.id;

      const user = await User.findById(userId);
      const openaiKey = user.apiKeys?.find(key => key.provider === 'openai')?.key;
      if (!openaiKey) {
        return res.status(400).json({
          error: 'OpenAI API key not found. Please add your OpenAI API key in settings.'
        });
      }

      const updated = await assistantService.updateAssistant(openaiKey, assistantId, { name, instructions, model, tools });
      res.json({ success: true, assistant: updated, message: 'Assistant updated successfully' });
    } catch (error) {
      console.error('Error updating assistant:', error);
      res.status(500).json({ error: 'Failed to update assistant', details: error.message });
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
      const { threadId, assistantId, message, session_id: sidFromBody } = req.body;
      const userId = req.user.id;
      
      if (!threadId || !message) {
        return res.status(400).json({ error: 'threadId and message are required' });
      }
      
      const user = await User.findById(userId);
      const openaiKey = user.apiKeys?.find(key => key.provider === 'openai')?.key;
      
      if (!openaiKey) {
        return res.status(400).json({
          error: 'OpenAI API key not found. Please add your OpenAI API key in settings.'
        });
      }
      
      // Fallback to most recent assistant if none provided
      let assistantToUse = assistantId;
      if (!assistantToUse) {
        const latest = await assistantService.getLatestAssistant(openaiKey);
        if (!latest) {
          return res.status(400).json({ error: 'No assistant specified and none found in your account.' });
        }
        assistantToUse = latest.id;
      }

      // Pull Context Capsule and prefix message if session provided
      let finalMessage = message;
      try {
        if (sidFromBody) {
          const HEX24 = /^[a-f0-9]{24}$/i;
          const sid = (String(sidFromBody).startsWith('conv:') || !HEX24.test(String(sidFromBody))) ? String(sidFromBody) : `conv:${sidFromBody}`;
          const ContextCapsule = require('../models/contextCapsule.model');
          const doc = await ContextCapsule.findOne({ session_id: sid }).lean();
          if (doc?.capsule) {
            const cap = doc.capsule;
            const preface = [
              '[CONTEXT CAPSULE]',
              `Goals: ${Array.isArray(cap.goals)&&cap.goals.length?cap.goals.join('; '):'—'}`,
              `Tone: ${Array.isArray(cap.tone_prefs)&&cap.tone_prefs.length?cap.tone_prefs.join('; '):'—'}`,
              `Constraints: ${Array.isArray(cap.constraints)&&cap.constraints.length?cap.constraints.join('; '):'—'}`,
              `Tags: ${Array.isArray(cap.tags)&&cap.tags.length?cap.tags.join(', '):'—'}`
            ].join('\n');
            finalMessage = `${preface}\n\n${message}`;
          }
        }
      } catch {}

      const result = await assistantService.sendMessage(openaiKey, threadId, assistantToUse, finalMessage, userId);
      
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
