const mongoose = require('mongoose');
const User = require('./models/user.model');
const Agent = require('./models/agent.model');

async function checkPerplexityAgent() {
  try {
    await mongoose.connect('mongodb://localhost:27017/symbi-synergy');
    
    const user = await User.findOne({ email: 'test@example.com' }).select('+apiKeys.key');
    if (!user) {
      console.log('User not found');
      return;
    }
    
    // Find Perplexity API key
    const perplexityKey = user.apiKeys.find(key => key.provider === 'perplexity' && key.isActive);
    if (!perplexityKey) {
      console.log('No active Perplexity API key found');
      return;
    }
    
    console.log('Found Perplexity API key:', perplexityKey._id);
    
    // Check if Perplexity agent exists
    const existingAgent = await Agent.findOne({ 
      user: user._id, 
      provider: 'perplexity' 
    });
    
    if (existingAgent) {
      console.log('Perplexity agent already exists:', existingAgent.name);
      console.log('Agent ID:', existingAgent._id);
      console.log('Model:', existingAgent.model);
      console.log('API Key ID:', existingAgent.apiKeyId);
      
      // Check if the agent's API key matches the current Perplexity key
      if (existingAgent.apiKeyId.toString() !== perplexityKey._id.toString()) {
        console.log('Updating agent API key...');
        existingAgent.apiKeyId = perplexityKey._id;
        await existingAgent.save();
        console.log('Agent API key updated successfully');
      }
    } else {
      console.log('Creating new Perplexity agent...');
      const newAgent = await Agent.create({
        name: 'Perplexity Assistant',
        description: 'AI assistant powered by Perplexity with real-time web search capabilities',
        user: user._id,
        provider: 'perplexity',
        model: 'llama-3.1-sonar-small-128k-online',
        apiKeyId: perplexityKey._id,
        systemPrompt: 'You are a helpful AI assistant powered by Perplexity with access to real-time information from the web. You can search the internet and provide up-to-date information on various topics. Always be accurate, helpful, and cite your sources when providing information.',
        temperature: 0.7,
        maxTokens: 1000,
        isPublic: false
      });
      
      console.log('Perplexity agent created successfully!');
      console.log('Agent ID:', newAgent._id);
      console.log('Agent Name:', newAgent.name);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkPerplexityAgent();