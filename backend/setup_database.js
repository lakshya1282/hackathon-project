const mongoose = require('mongoose');
const User = require('./models/user');
const Blog = require('./models/blog');

async function setupDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/devnovate-blog');
    console.log('Connected to MongoDB');

    // Promote admin user to admin role
    const adminUser = await User.findOneAndUpdate(
      { email: 'admin@example.com' },
      { role: 'admin' },
      { new: true }
    );
    
    if (adminUser) {
      console.log(`Promoted ${adminUser.username} to admin role`);
    } else {
      console.log('Admin user not found');
    }

    // Get all pending blogs
    const pendingBlogs = await Blog.find({ status: 'pending' }).populate('author', 'username');
    console.log(`Found ${pendingBlogs.length} pending blogs`);

    // Approve all pending blogs
    for (const blog of pendingBlogs) {
      blog.status = 'approved';
      blog.publishedAt = new Date();
      await blog.save();
      console.log(`Approved blog: "${blog.title}" by ${blog.author.username}`);
    }

    // Display final stats
    const stats = {
      totalBlogs: await Blog.countDocuments(),
      pendingBlogs: await Blog.countDocuments({ status: 'pending' }),
      approvedBlogs: await Blog.countDocuments({ status: 'approved' }),
      totalUsers: await User.countDocuments()
    };

    console.log('\nFinal Database Stats:');
    console.log(`Total Blogs: ${stats.totalBlogs}`);
    console.log(`Pending Blogs: ${stats.pendingBlogs}`);
    console.log(`Approved Blogs: ${stats.approvedBlogs}`);
    console.log(`Total Users: ${stats.totalUsers}`);

    await mongoose.disconnect();
    console.log('\nDatabase setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

setupDatabase();
