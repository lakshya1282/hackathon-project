const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

async function listUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/devnovate-blog', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find({}, 'username email role createdAt').sort({ createdAt: -1 });
    
    console.log('\n=== ALL USERS ===');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
      console.log('---');
    });

    // Show admin users specifically
    const adminUsers = users.filter(user => user.role === 'admin');
    console.log(`\n=== ADMIN USERS (${adminUsers.length}) ===`);
    adminUsers.forEach((user, index) => {
      console.log(`${index + 1}. Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log('---');
    });

  } catch (error) {
    console.error('Error listing users:', error);
  } finally {
    mongoose.connection.close();
  }
}

listUsers();
