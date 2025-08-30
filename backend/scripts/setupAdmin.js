const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

async function setupAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/devnovate-blog', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');

    // Remove existing admin if exists
    await User.deleteMany({ role: 'admin' });
    console.log('Removed existing admin users');

    // Create new admin user with known credentials
    const adminUser = new User({
      username: 'admin',
      email: 'admin@devnovate.com',
      password: 'admin123', // Will be hashed by the schema pre-save hook
      role: 'admin'
    });

    await adminUser.save();
    console.log('\n✅ Admin user created successfully!');
    console.log('=== ADMIN LOGIN CREDENTIALS ===');
    console.log('Email: admin@devnovate.com');
    console.log('Password: admin123');
    console.log('Username: admin');
    console.log('Role: admin');
    console.log('\nYou can now login with these credentials to access the admin dashboard!');

  } catch (error) {
    console.error('Error setting up admin user:', error);
  } finally {
    mongoose.connection.close();
  }
}

setupAdminUser();
