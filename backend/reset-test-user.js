const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user.model');

async function resetTestUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/symbi-synergy');
    console.log('Connected to MongoDB');
    
    // Find the test user
    let user = await User.findOne({email: 'test@example.com'});
    
    if (user) {
      console.log('✅ Test user found, updating password...');
      
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('testpassword123', salt);
      
      // Update the user's password
      user.password = hashedPassword;
      await user.save();
      
      console.log('✅ Password updated successfully');
    } else {
      console.log('❌ Test user not found, creating new user...');
      
      // Create new test user
      user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'testpassword123' // This will be hashed by the model's pre-save hook
      });
      
      console.log('✅ Test user created successfully');
    }
    
    console.log('User details:');
    console.log('  Email:', user.email);
    console.log('  Name:', user.name);
    console.log('  ID:', user._id);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

resetTestUser();