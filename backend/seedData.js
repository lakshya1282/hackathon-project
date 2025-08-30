const mongoose = require('mongoose');
const User = require('./models/user');
const Blog = require('./models/blog');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/devnovate-blog', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function seedData() {
  try {
    console.log('Starting to seed demo data...');

    // Create demo users
    const demoUsers = [
      {
        username: 'alice_dev',
        email: 'alice@demo.com',
        password: 'demopass123',
        bio: 'Full-stack developer passionate about React and Node.js'
      },
      {
        username: 'bob_designer',
        email: 'bob@demo.com', 
        password: 'demopass123',
        bio: 'UI/UX designer with a love for clean, modern interfaces'
      },
      {
        username: 'charlie_data',
        email: 'charlie@demo.com',
        password: 'demopass123',
        bio: 'Data scientist exploring the intersection of AI and web development'
      }
    ];

    for (const userData of demoUsers) {
      const existingUser = await User.findOne({ username: userData.username });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`✅ Created user: ${userData.username}`);
      } else {
        console.log(`User ${userData.username} already exists`);
      }
    }

    // Get users for blog creation
    const alice = await User.findOne({ username: 'alice_dev' });
    const bob = await User.findOne({ username: 'bob_designer' });
    const charlie = await User.findOne({ username: 'charlie_data' });

    if (alice && bob && charlie) {
      // Create demo blogs
      const demoBlogs = [
        {
          title: 'Advanced React Patterns for 2024',
          content: 'Explore the latest React patterns including Custom Hooks, Compound Components, and Render Props. This comprehensive guide covers modern React development techniques that will make your applications more maintainable and performant. We\'ll dive deep into real-world examples and best practices.',
          excerpt: 'Modern React patterns and best practices for 2024',
          author: alice._id,
          category: 'Web Development',
          tags: ['React', 'JavaScript', 'Frontend', 'Patterns'],
          status: 'approved',
          publishedAt: new Date(),
          likes: [bob._id, charlie._id],
          views: 150
        },
        {
          title: 'Design Systems: Building Consistent UIs',
          content: 'Learn how to create and maintain design systems that scale across teams and projects. We\'ll cover component libraries, design tokens, documentation strategies, and tools like Storybook. A well-designed system ensures consistency and speeds up development.',
          excerpt: 'Guide to creating scalable design systems',
          author: bob._id,
          category: 'Design',
          tags: ['Design System', 'UI/UX', 'Components', 'Storybook'],
          status: 'approved',
          publishedAt: new Date(),
          likes: [alice._id],
          views: 89
        },
        {
          title: 'Machine Learning for Web Developers',
          content: 'Discover how to integrate machine learning into web applications. We\'ll explore TensorFlow.js, practical use cases, and step-by-step implementation guides. From image recognition to natural language processing, ML is becoming more accessible to web developers.',
          excerpt: 'Integrating ML into web applications',
          author: charlie._id,
          category: 'Technology',
          tags: ['Machine Learning', 'TensorFlow', 'AI', 'JavaScript'],
          status: 'approved',
          publishedAt: new Date(),
          likes: [alice._id, bob._id],
          views: 203
        }
      ];

      for (const blogData of demoBlogs) {
        const existingBlog = await Blog.findOne({ title: blogData.title });
        if (!existingBlog) {
          const blog = new Blog(blogData);
          await blog.save();
          console.log(`✅ Created blog: ${blogData.title}`);
          
          // Add some demo comments
          const comments = [
            {
              user: alice._id,
              text: 'Great article! Very informative.',
              createdAt: new Date()
            },
            {
              user: bob._id,
              text: 'Thanks for sharing this. Really helpful insights.',
              createdAt: new Date()
            }
          ];
          
          blog.comments.push(...comments);
          await blog.save();
          console.log(`✅ Added comments to: ${blogData.title}`);
        } else {
          console.log(`Blog "${blogData.title}" already exists`);
        }
      }
    }

    console.log('✅ Demo data seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
  } finally {
    process.exit();
  }
}

seedData();
