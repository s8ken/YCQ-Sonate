const mongoose = require('mongoose');
const User = require('./models/user.model');
require('dotenv').config();

async function createTestUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/symbi-synergy');
    console.log('Connected to MongoDB');
    
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    
    if (existingUser) {
      console.log('✅ Test user already exists:', {
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email
      });
    } else {
      // Create new test user
      const testUser = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'testpassword123'
      });
      
      await testUser.save();
      console.log('✅ Test user created successfully:', {
        id: testUser._id,
        name: testUser.name,
        email: testUser.email
      });
    }
    
    // List all users for verification
    const allUsers = await User.find({}, 'name email createdAt');
    console.log('\n📋 All users in database:');
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Created: ${user.createdAt}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

createTestUser();