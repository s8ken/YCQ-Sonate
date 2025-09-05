const mongoose = require('mongoose');
const User = require('./models/user.model');
const Agent = require('./models/agent.model');

async function setupMissingAgents() {
  try {
    await mongoose.connect('mongodb://localhost:27017/symbi-synergy');
    
    const user = await User.findOne({ email: 'test@example.com' }).select('+apiKeys.key');
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('Setting up missing agents...');
    
    // Define agent configurations
    const agentConfigs = [
      {
        name: 'OpenAI Assistant',
        description: 'AI assistant powered by OpenAI GPT models with advanced reasoning capabilities',
        provider: 'openai',
        model: 'gpt-4o',
        systemPrompt: 'You are a helpful AI assistant powered by OpenAI. You have advanced reasoning capabilities and can help with a wide variety of tasks including analysis, writing, coding, and problem-solving. Always be accurate, helpful, and provide detailed explanations when needed.',
        temperature: 0.7,
        maxTokens: 1000
      },
      {
        name: 'Anthropic Assistant',
        description: 'AI assistant powered by Anthropic Claude with strong analytical and ethical reasoning',
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
        systemPrompt: 'You are a helpful AI assistant powered by Anthropic Claude. You excel at analytical thinking, ethical reasoning, and providing thoughtful, well-structured responses. Focus on being helpful, accurate, and considerate in all interactions.',
        temperature: 0.7,
        maxTokens: 1000
      },
      {
        name: 'v0 Assistant',
        description: 'AI assistant powered by v0 for web development and UI/UX design tasks',
        provider: 'v0',
        model: 'v0-1',
        systemPrompt: 'You are a helpful AI assistant powered by v0, specialized in web development, UI/UX design, and frontend technologies. You can help with React, Next.js, Tailwind CSS, and modern web development practices.',
        temperature: 0.7,
        maxTokens: 1000
      }
    ];
    
    for (const config of agentConfigs) {
      // Check if agent already exists
      const existingAgent = await Agent.findOne({ 
        user: user._id, 
        provider: config.provider 
      });
      
      if (existingAgent) {
        console.log(`${config.provider} agent already exists: ${existingAgent.name}`);
        continue;
      }
      
      // Find API key for this provider
      const apiKey = user.apiKeys.find(key => key.provider === config.provider && key.isActive);
      if (!apiKey) {
        console.log(`No active API key found for ${config.provider}, skipping...`);
        continue;
      }
      
      if (!apiKey.key) {
        console.log(`API key for ${config.provider} is missing key value, skipping...`);
        continue;
      }
      
      console.log(`Creating ${config.provider} agent...`);
      
      const newAgent = await Agent.create({
        name: config.name,
        description: config.description,
        user: user._id,
        provider: config.provider,
        model: config.model,
        apiKeyId: apiKey._id,
        systemPrompt: config.systemPrompt,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        isPublic: false
      });
      
      console.log(`✓ ${config.provider} agent created successfully!`);
      console.log(`  Agent ID: ${newAgent._id}`);
      console.log(`  Agent Name: ${newAgent.name}`);
      console.log(`  API Key ID: ${newAgent.apiKeyId}`);
    }
    
    console.log('\nAgent setup complete!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

setupMissingAgents();