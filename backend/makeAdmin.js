const mongoose = require('mongoose');
const User = require('./models/user');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/devnovate-blog', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function makeAdmin(username) {
  try {
    const user = await User.findOneAndUpdate(
      { username: username },
      { role: 'admin' },
      { new: true }
    );
    
    if (user) {
      console.log(`✅ User ${username} promoted to admin successfully`);
    } else {
      console.log(`❌ User ${username} not found`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit();
  }
}

const username = process.argv[2];
if (!username) {
  console.log('Usage: node makeAdmin.js <username>');
  process.exit(1);
}

makeAdmin(username);
