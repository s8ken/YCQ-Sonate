const mongoose = require('mongoose');
const User = require('./models/user.model');
const Agent = require('./models/agent.model');

async function debugAgentKeys() {
  try {
    await mongoose.connect('mongodb://localhost:27017/symbi-synergy');
    
    const user = await User.findOne({ email: 'test@example.com' }).select('+apiKeys.key');
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('=== USER API KEYS ==>');
    user.apiKeys.forEach((key, index) => {
      console.log(`${index + 1}. Provider: ${key.provider}`);
      console.log(`   Name: ${key.name}`);
      console.log(`   ID: ${key._id}`);
      console.log(`   Active: ${key.isActive}`);
      console.log(`   Has Key: ${!!key.key}`);
      console.log(`   Key Length: ${key.key ? key.key.length : 0}`);
      console.log(`   Key Preview: ${key.key ? key.key.substring(0, 10) + '...' : 'MISSING'}`);
      console.log('---');
    });
    
    console.log('\n=== USER AGENTS ==>');
    const agents = await Agent.find({ user: user._id });
    
    for (const agent of agents) {
      console.log(`Agent: ${agent.name}`);
      console.log(`  ID: ${agent._id}`);
      console.log(`  Provider: ${agent.provider}`);
      console.log(`  Model: ${agent.model}`);
      console.log(`  API Key ID: ${agent.apiKeyId}`);
      
      // Find the corresponding API key
      const apiKey = user.apiKeys.id(agent.apiKeyId);
      if (apiKey) {
        console.log(`  API Key Found: YES`);
        console.log(`  API Key Provider: ${apiKey.provider}`);
        console.log(`  API Key Active: ${apiKey.isActive}`);
        console.log(`  API Key Has Value: ${!!apiKey.key}`);
        console.log(`  API Key Length: ${apiKey.key ? apiKey.key.length : 0}`);
        
        // Check for issues
        const issues = [];
        if (!apiKey.key) issues.push('Missing key value');
        if (!apiKey.isActive) issues.push('Key is inactive');
        if (apiKey.provider !== agent.provider) issues.push(`Provider mismatch: agent=${agent.provider}, key=${apiKey.provider}`);
        
        if (issues.length > 0) {
          console.log(`  ISSUES: ${issues.join(', ')}`);
        } else {
          console.log(`  STATUS: OK`);
        }
      } else {
        console.log(`  API Key Found: NO - MISSING API KEY!`);
        console.log(`  STATUS: CRITICAL - Agent references non-existent API key`);
      }
      console.log('---');
    }
    
    // Check for orphaned API keys
    console.log('\n=== ORPHANED API KEYS ==>');
    const agentApiKeyIds = agents.map(a => a.apiKeyId.toString());
    const orphanedKeys = user.apiKeys.filter(key => !agentApiKeyIds.includes(key._id.toString()));
    
    if (orphanedKeys.length > 0) {
      orphanedKeys.forEach(key => {
        console.log(`Orphaned Key: ${key.name} (${key.provider}) - ID: ${key._id}`);
      });
    } else {
      console.log('No orphaned API keys found.');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

debugAgentKeys();