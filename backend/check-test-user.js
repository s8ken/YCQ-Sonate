const mongoose = require('mongoose');
const User = require('./models/user.model');

async function checkTestUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/symbi-synergy');
    console.log('Connected to MongoDB');
    
    const user = await User.findOne({email: 'test@example.com'});
    
    if (user) {
      console.log('✅ Test user found:');
      console.log('  Email:', user.email);
      console.log('  Name:', user.name);
      console.log('  ID:', user._id);
      console.log('  API Keys count:', user.apiKeys ? user.apiKeys.length : 0);
    } else {
      console.log('❌ Test user not found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkTestUser();