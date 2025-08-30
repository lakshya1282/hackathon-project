const express = require('express');
const Blog = require('../models/blog');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// Get all approved blogs with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const category = req.query.category || '';
    const sort = req.query.sort || 'createdAt';

    let query = { status: 'approved' };

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    const blogs = await Blog.find(query)
      .populate('author', 'username profilePicture')
      .populate('comments.user', 'username profilePicture')
      .sort({ [sort]: -1 })
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

// Get trending blogs with improved algorithm
router.get('/trending', async (req, res) => {
  try {
    const blogs = await Blog.find({ status: 'approved' })
      .populate('author', 'username profilePicture')
      .populate('comments.user', 'username profilePicture')
      .lean();

    // Calculate trending score for each blog
    const now = new Date();
    const blogsWithScore = blogs.map(blog => {
      const likesCount = blog.likes ? blog.likes.length : 0;
      const commentsCount = blog.comments ? blog.comments.length : 0;
      const views = blog.views || 0;
      
      // Time decay factor (newer posts get higher score)
      const createdAt = new Date(blog.createdAt);
      const ageInDays = (now - createdAt) / (1000 * 60 * 60 * 24);
      const timeDecay = Math.max(0.1, 1 / (1 + ageInDays * 0.1));
      
      // Weighted scoring algorithm
      const score = (
        (likesCount * 3) +        // Likes are weighted highest
        (commentsCount * 2) +    // Comments show engagement
        (views * 0.1)            // Views are least weighted
      ) * timeDecay;              // Apply time decay
      
      return {
        ...blog,
        trendingScore: score
      };
    });

    // Sort by trending score and return top 10
    const trendingBlogs = blogsWithScore
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, 10);

    res.json(trendingBlogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single blog
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'username profilePicture bio')
      .populate('comments.user', 'username profilePicture');

    if (!blog || blog.status !== 'approved') {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Increment views
    blog.views += 1;
    await blog.save();

    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new blog with validation
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, content, excerpt, tags, category, featuredImage } = req.body;

    // Validation
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ message: 'Title is required' });
    }
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Content is required' });
    }
    if (!category) {
      return res.status(400).json({ message: 'Category is required' });
    }
    
    // Auto-generate excerpt if not provided
    const autoExcerpt = excerpt || content.substring(0, 200) + (content.length > 200 ? '...' : '');

    const blog = new Blog({
      title: title.trim(),
      content: content.trim(),
      excerpt: autoExcerpt.trim(),
      author: req.user._id,
      tags: Array.isArray(tags) ? tags.filter(tag => tag.trim()) : [],
      category,
      featuredImage: featuredImage || '',
      status: 'pending'
    });

    await blog.save();
    await blog.populate('author', 'username profilePicture');

    res.status(201).json(blog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update blog (only by author and only if pending or rejected)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!['pending', 'rejected', 'draft'].includes(blog.status)) {
      return res.status(400).json({ message: 'Cannot edit approved or hidden blogs' });
    }

    const { title, content, excerpt, tags, category, featuredImage } = req.body;

    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.excerpt = excerpt || blog.excerpt;
    blog.tags = tags || blog.tags;
    blog.category = category || blog.category;
    blog.featuredImage = featuredImage || blog.featuredImage;
    blog.status = 'pending'; // Reset to pending after edit

    await blog.save();
    await blog.populate('author', 'username profilePicture');

    res.json(blog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Like/Unlike blog
router.post('/:id/like', authenticate, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog || blog.status !== 'approved') {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const likeIndex = blog.likes.indexOf(req.user._id);

    if (likeIndex > -1) {
      // Unlike
      blog.likes.splice(likeIndex, 1);
    } else {
      // Like
      blog.likes.push(req.user._id);
    }

    await blog.save();

    res.json({ 
      likes: blog.likes.length,
      isLiked: blog.likes.includes(req.user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add comment with validation
router.post('/:id/comment', authenticate, async (req, res) => {
  try {
    const { text } = req.body;
    
    // Validate comment text
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Comment text is required' });
    }
    
    if (text.trim().length > 1000) {
      return res.status(400).json({ message: 'Comment too long (max 1000 characters)' });
    }
    
    const blog = await Blog.findById(req.params.id);

    if (!blog || blog.status !== 'approved') {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const comment = {
      user: req.user._id,
      text: text.trim(),
      createdAt: new Date()
    };

    blog.comments.push(comment);
    await blog.save();
    
    // Populate the new comment with user data
    await blog.populate({
      path: 'comments.user',
      select: 'username profilePicture'
    });

    // Return the newly added comment with populated user data
    const newComment = blog.comments[blog.comments.length - 1];
    res.status(201).json(newComment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user's blogs
router.get('/user/my-blogs', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const blogs = await Blog.find({ author: req.user._id })
      .populate('author', 'username profilePicture')
      .populate('comments.user', 'username profilePicture')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Blog.countDocuments({ author: req.user._id });

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

// Delete comment
router.delete('/:id/comment/:commentId', authenticate, async (req, res) => {
  try {
    const { id: blogId, commentId } = req.params;
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const comment = blog.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Only allow comment author or admin to delete comment
    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    blog.comments.pull(commentId);
    await blog.save();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete blog (users can delete their own blogs)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Only allow author to delete their own blog
    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this blog' });
    }

    await Blog.findByIdAndDelete(req.params.id);

    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
