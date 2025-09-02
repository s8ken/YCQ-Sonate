const mongoose = require('mongoose');
const User = require('./models/user.model');
require('dotenv').config();

async function testAuth() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/symbi-synergy');
    console.log('Connected to MongoDB');
    
    // Create a fresh test user with known password
    const testEmail = 'weaviate-test@example.com';
    const testPassword = 'testpass123';
    
    // Delete existing test user if exists
    await User.deleteOne({ email: testEmail });
    
    // Create new test user
    const testUser = new User({
      name: 'Weaviate Test User',
      email: testEmail,
      password: testPassword
    });
    
    await testUser.save();
    console.log('✅ Created test user:', testUser.email);
    
    // Test password matching
    const savedUser = await User.findOne({ email: testEmail }).select('+password');
    const isMatch = await savedUser.matchPassword(testPassword);
    console.log('✅ Password match test:', isMatch);
    
    console.log('\n🔑 Use these credentials for testing:');
    console.log('Email:', testEmail);
    console.log('Password:', testPassword);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testAuth();