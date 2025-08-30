const express = require('express');
const Blog = require('../models/blog');
const User = require('../models/user');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

// Get dashboard stats
router.get('/dashboard', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const totalBlogs = await Blog.countDocuments();
    const pendingBlogs = await Blog.countDocuments({ status: 'pending' });
    const approvedBlogs = await Blog.countDocuments({ status: 'approved' });
    const totalUsers = await User.countDocuments({ role: 'user' });

    const recentBlogs = await Blog.find({ status: 'pending' })
      .populate('author', 'username email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        totalBlogs,
        pendingBlogs,
        approvedBlogs,
        totalUsers
      },
      recentBlogs
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all blogs for admin
router.get('/blogs', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || '';

    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const blogs = await Blog.find(query)
      .populate('author', 'username email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Blog.countDocuments(query);

    res.json({
      blogs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve blog
router.put('/blogs/:id/approve', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    blog.status = 'approved';
    blog.publishedAt = new Date();
    await blog.save();

    res.json({ message: 'Blog approved successfully', blog });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject blog
router.put('/blogs/:id/reject', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { feedback } = req.body;
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    blog.status = 'rejected';
    blog.adminFeedback = feedback || '';
    await blog.save();

    res.json({ message: 'Blog rejected', blog });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Hide blog
router.put('/blogs/:id/hide', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    blog.status = 'hidden';
    await blog.save();

    res.json({ message: 'Blog hidden successfully', blog });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete blog
router.delete('/blogs/:id', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    await Blog.findByIdAndDelete(req.params.id);

    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;