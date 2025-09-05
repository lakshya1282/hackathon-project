import React, { useState, useEffect, useContext, createContext, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import BlogDetailPage from './BlogDetailPage';
import BlogDetail from './components/BlogDetail';
import { Search, Heart, MessageCircle, Eye, User, Plus, Calendar, TrendingUp, Edit, Trash2, Check, X, Menu, Home, BookOpen, Users, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard, ModernButton, ModernInput, ModernCard, StatsCard, ModernBadge, ModernSkeleton, GradientText } from './components/ModernUI';

// Context for Authentication
const AuthContext = createContext();

// Mock API calls (replace with actual API endpoints)
const API_BASE = 'http://localhost:5000/api';

const api = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }
    return await response.json();
  },
  
  register: async (username, email, password) => {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }
    return await response.json();
  },

  getBlogs: async (page = 1, search = '', category = '') => {
    const params = new URLSearchParams({ page, search, category });
    const response = await fetch(`${API_BASE}/blogs?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch blogs');
    }
    return await response.json();
  },

  getTrendingBlogs: async () => {
    const response = await fetch(`${API_BASE}/blogs/trending`);
    if (!response.ok) {
      throw new Error('Failed to fetch trending blogs');
    }
    return await response.json();
  },

  getUserBlogs: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/blogs/user/my-blogs`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch user blogs');
    }
    return await response.json();
  },

  createBlog: async (blogData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/blogs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(blogData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create blog');
    }
    return await response.json();
  },

  // Admin API calls
  getAdminDashboard: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch admin dashboard');
    }
    return await response.json();
  },

  getAdminBlogs: async (page = 1, status = '') => {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams({ page, status });
    const response = await fetch(`${API_BASE}/admin/blogs?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch admin blogs');
    }
    return await response.json();
  },

  approveBlog: async (blogId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/admin/blogs/${blogId}/approve`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to approve blog');
    }
    return await response.json();
  },

  rejectBlog: async (blogId, feedback = '') => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/admin/blogs/${blogId}/reject`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ feedback }),
    });
    if (!response.ok) {
      throw new Error('Failed to reject blog');
    }
    return await response.json();
  },

  // Like/Unlike blog
  toggleLike: async (blogId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/blogs/${blogId}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to toggle like');
    }
    return await response.json();
  },

  // Add comment
  addComment: async (blogId, text) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/blogs/${blogId}/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) {
      throw new Error('Failed to add comment');
    }
    return await response.json();
  },

  // Update blog
  updateBlog: async (blogId, blogData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/blogs/${blogId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(blogData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update blog');
    }
    return await response.json();
  },

  // Delete blog
  deleteBlog: async (blogId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/blogs/${blogId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete blog');
    }
    return await response.json();
  }
};

// Auth Provider Component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.login(email, password);
      // Backend returns { token, user: { id, username, email, role } }
      setUser(response.user);
      localStorage.setItem('token', response.token);
      return response;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password) => {
    setLoading(true);
    try {
      const response = await api.register(username, email, password);
      // Backend returns { token, user: { id, username, email, role } }
      setUser(response.user);
      localStorage.setItem('token', response.token);
      return response;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  const verifyToken = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('token');
      }
    }
  };

  useEffect(() => {
    verifyToken();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

// Header Component
const Header = ({ currentView, setCurrentView }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.header 
      className="glass-morphism sticky top-0 z-50 border-b border-white/20"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <GradientText className="text-2xl font-bold text-shadow">
              DevNovate
            </GradientText>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-2">
            {[
              { key: 'home', icon: Home, label: 'Home' },
              { key: 'trending', icon: TrendingUp, label: 'Trending' },
              ...(user ? [
                { key: 'create', icon: Plus, label: 'Write' },
                { key: 'profile', icon: User, label: 'Profile' },
                ...(user.role === 'admin' ? [{ key: 'admin', icon: BarChart3, label: 'Admin' }] : [])
              ] : [])
            ].map(({ key, icon: Icon, label }) => (
              <motion.button
                key={key}
                onClick={() => setCurrentView(key)}
                className={`
                  flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300
                  ${currentView === key 
                    ? 'bg-glass-300 text-primary-700 shadow-md border border-white/30' 
                    : 'text-dark-600 hover:bg-glass-200 hover:text-primary-600'
                  }
                `}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </motion.button>
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <motion.span 
                  className="text-sm text-dark-600 font-medium"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  Hello, <GradientText>{user.username || 'User'}</GradientText>
                </motion.span>
                <ModernButton
                  variant="secondary"
                  size="sm"
                  onClick={logout}
                >
                  Logout
                </ModernButton>
              </>
            ) : (
              <ModernButton
                variant="primary"
                size="sm"
                onClick={() => setCurrentView('login')}
              >
                Login
              </ModernButton>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            <button
              onClick={() => {setCurrentView('home'); setMobileMenuOpen(false);}}
              className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </button>
            <button
              onClick={() => {setCurrentView('trending'); setMobileMenuOpen(false);}}
              className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Trending
            </button>
            {user && (
              <>
                <button
                  onClick={() => {setCurrentView('create'); setMobileMenuOpen(false);}}
                  className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Write
                </button>
                <button
                  onClick={() => {setCurrentView('profile'); setMobileMenuOpen(false);}}
                  className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </button>
                {user.role === 'admin' && (
                  <button
                    onClick={() => {setCurrentView('admin'); setMobileMenuOpen(false);}}
                    className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Admin
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </motion.header>
  );
};

// Blog Card Component
const BlogCard = ({ blog, onLike, onComment, onRefresh }) => {
  const navigate = typeof useNavigate === 'function' ? useNavigate() : null;
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Array.isArray(blog.likes) ? blog.likes.length : blog.likes || 0);
  const [showComments, setShowComments] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    // Check if current user has liked this blog
    if (user && Array.isArray(blog.likes)) {
      setLiked(blog.likes.includes(user.id));
      setLikeCount(blog.likes.length);
    } else if (typeof blog.likes === 'number') {
      setLikeCount(blog.likes);
    }
  }, [blog.likes, user]);

  const handleLike = async () => {
    if (!user) {
      alert('Please login to like blogs');
      return;
    }

    try {
      const response = await api.toggleLike(blog._id);
      setLiked(response.isLiked);
      setLikeCount(response.likes);
      onLike && onLike(blog._id, response);
    } catch (error) {
      console.error('Error toggling like:', error);
      alert('Failed to update like');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to comment');
      return;
    }
    
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const newComment = await api.addComment(blog._id, commentText);
      setCommentText('');
      onComment && onComment(blog._id, newComment);
      onRefresh && onRefresh(); // Refresh blog data to get updated comments
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <ModernCard 
      className="overflow-hidden group cursor-pointer glow-on-hover" 
      glow={true}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {blog.featuredImage && (
        <div className="relative overflow-hidden">
          <motion.img 
            src={blog.featuredImage} 
            alt={blog.title}
            className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <motion.div
            className="absolute top-4 right-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <ModernBadge variant="glass" size="sm">
              {blog.category}
            </ModernBadge>
          </motion.div>
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-center text-sm text-dark-500 mb-3">
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-6 h-6 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full flex items-center justify-center mr-2">
              <User className="w-3 h-3 text-white" />
            </div>
            <span className="font-medium">{blog.author && blog.author.username ? blog.author.username : 'Unknown'}</span>
          </motion.div>
          <span className="mx-2 text-dark-300">•</span>
          <div className="flex items-center text-dark-400">
            <Calendar className="w-3 h-3 mr-1" />
            <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-dark-900 mb-3 line-clamp-2 group-hover:text-primary-700 transition-colors duration-300">
          {blog.title}
        </h3>
        
        <p className="text-dark-600 mb-4 line-clamp-3 leading-relaxed">
          {blog.excerpt}
        </p>
        <button
          className="px-4 py-2 mb-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium transition-colors duration-200"
          onClick={() => navigate && navigate(`/blog/${blog._id}`)}
        >View</button>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <motion.button 
              onClick={handleLike}
              className={`flex items-center space-x-1 px-2 py-1 rounded-lg transition-all duration-300 ${
                liked ? 'text-red-500 bg-red-50' : 'text-dark-500 hover:text-red-500 hover:bg-red-50'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Heart className={`w-4 h-4 transition-all duration-300 ${liked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{likeCount}</span>
            </motion.button>
            
            <motion.button 
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-1 px-2 py-1 rounded-lg text-dark-500 hover:text-primary-500 hover:bg-primary-50 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-medium">{Array.isArray(blog.comments) ? blog.comments.length : blog.comments || 0}</span>
            </motion.button>
            
            <div className="flex items-center space-x-1 text-dark-400">
              <Eye className="w-4 h-4" />
              <span className="text-sm">{blog.views}</span>
            </div>
          </div>
        </div>
        
        {blog.tags && blog.tags.length > 0 && (
          <motion.div 
            className="flex flex-wrap gap-2 mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {blog.tags.map((tag, index) => (
              <ModernBadge 
                key={index} 
                variant="glass" 
                size="sm"
                className="text-xs"
              >
                #{tag}
              </ModernBadge>
            ))}
          </motion.div>
        )}
        
        {/* Comments Section */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ opacity: 0, blockSize: 0 }}
              animate={{ opacity: 1, blockSize: 'auto' }}
              exit={{ opacity: 0, blockSize: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-gray-100 pt-4 mt-4"
            >
              {/* Existing Comments */}
              <div className="space-y-3 mb-4">
                {blog.comments && blog.comments.length > 0 ? (
                  blog.comments.slice(0, 3).map((comment, index) => (
                    <motion.div
                      key={comment._id || index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="bg-gray-50 rounded-lg p-3"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              {comment.user?.username || 'Anonymous'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 'Recently'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{comment.text || comment.content}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No comments yet. Be the first to comment!
                  </p>
                )}
                
                {blog.comments && blog.comments.length > 3 && (
                  <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    View all {blog.comments.length} comments
                  </button>
                )}
              </div>
              
              {/* Add Comment Form */}
              {user && (
                <motion.form
                  onSubmit={handleAddComment}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="flex space-x-3"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                      disabled={submittingComment}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingComment || !commentText.trim()}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 text-sm font-medium transition-colors duration-200"
                  >
                    {submittingComment ? 'Posting...' : 'Post'}
                  </button>
                </motion.form>
              )}
              
              {!user && (
                <p className="text-sm text-gray-500 text-center py-2">
                  Please login to add comments
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ModernCard>
  );
};

// Login Component
const LoginForm = ({ onSuccess }) => {
  const { login, register, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.username, formData.email, formData.password);
      }
      onSuccess();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-10 left-10 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: '4s' }} />
      </div>
      
      <motion.div 
        className="max-w-md w-full space-y-8 relative z-10"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <GlassCard className="p-8">
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GradientText className="text-3xl font-bold mb-2">
              {isLogin ? 'Welcome Back' : 'Join DevNovate'}
            </GradientText>
            <p className="text-dark-600">
              {isLogin ? 'Sign in to your account' : 'Create your account'}
            </p>
          </motion.div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div 
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl backdrop-blur-md"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {error}
              </motion.div>
            )}
            
            <div className="space-y-4">
              <AnimatePresence>
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, blockSize: 0 }}
                    animate={{ opacity: 1, blockSize: 'auto' }}
                    exit={{ opacity: 0, blockSize: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ModernInput
                      type="text"
                      placeholder="Username"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      icon={User}
                      required
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              
              <ModernInput
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
              
              <ModernInput
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>

            <div className="space-y-4">
              <ModernButton
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full"
              >
                {isLogin ? 'Sign in' : 'Sign up'}
              </ModernButton>
              
              <motion.button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="w-full text-center text-primary-600 hover:text-primary-500 text-sm font-medium transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </motion.button>
            </div>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
};

// Home Page Component
const HomePage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const categories = ['All', 'Technology', 'Programming', 'Web Development', 'Mobile Development', 'AI/ML', 'DevOps', 'Design'];

  const loadBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getBlogs(currentPage, searchQuery, selectedCategory);
      setBlogs(data.blogs);
    } catch (error) {
      console.error('Error loading blogs:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, selectedCategory]);

  useEffect(() => {
    loadBlogs();
  }, [loadBlogs]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadBlogs();
  };

  const handleLike = (blogId, response) => {
    // Update the specific blog's like data in the local state
    setBlogs(prev => prev.map(blog => 
      blog._id === blogId 
        ? { ...blog, likes: response.isLiked ? 
            [...(Array.isArray(blog.likes) ? blog.likes : []), response.userId] :
            (Array.isArray(blog.likes) ? blog.likes.filter(id => id !== response.userId) : []) 
          }
        : blog
    ));
  };

  const handleComment = (blogId, newComment) => {
    // Update the specific blog's comment data in the local state
    setBlogs(prev => prev.map(blog => 
      blog._id === blogId 
        ? { ...blog, comments: [...(blog.comments || []), newComment] }
        : blog
    ));
  };

  const handleRefresh = () => {
    loadBlogs();
  };

  return (
    <motion.div 
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Hero Section */}
      <motion.div 
        className="text-center mb-16 relative"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="relative z-10">
          <motion.h1 
            className="text-5xl md:text-6xl font-bold mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Welcome to <GradientText className="text-shadow-lg">DevNovate</GradientText>
          </motion.h1>
          <motion.p 
            className="text-xl text-dark-600 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Discover the latest insights, tutorials, and trends in software development from our amazing community
          </motion.p>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" />
        <div className="absolute top-10 right-1/4 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: '2s' }} />
      </motion.div>

      {/* Search and Filter */}
      <motion.div 
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <GlassCard className="p-6 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <ModernInput
                type="text"
                placeholder="Search blogs, tutorials, insights..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={Search}
              />
            </div>
            <ModernButton
              type="submit"
              variant="primary"
              icon={Search}
            >
              Search
            </ModernButton>
          </form>
        </GlassCard>

        {/* Category Filter */}
        <motion.div 
          className="flex flex-wrap gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          {categories.map((category, index) => (
            <motion.button
              key={category}
              onClick={() => {setSelectedCategory(category); setCurrentPage(1);}}
              className={`
                px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105
                ${selectedCategory === category
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                  : 'bg-glass-200 backdrop-blur-md border border-white/20 text-dark-700 hover:bg-glass-300'
                }
              `}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 1 + (index * 0.1) }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              {category}
            </motion.button>
          ))}
        </motion.div>
      </motion.div>

      {/* Blog Grid */}
      <AnimatePresence>
        {loading ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <ModernSkeleton className="h-80 p-6" lines={8} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {blogs.map((blog, index) => (
              <motion.div
                key={blog._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <BlogCard 
                  blog={blog} 
                  onLike={handleLike}
                  onComment={handleComment}
                  onRefresh={handleRefresh}
                  onBlogClick={onBlogClick}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {blogs.length === 0 && !loading && (
        <motion.div 
          className="text-center py-16"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="floating-element"
            whileHover={{ scale: 1.1 }}
          >
            <BookOpen className="w-20 h-20 text-dark-300 mx-auto mb-6" />
          </motion.div>
          <h3 className="text-2xl font-bold text-dark-900 mb-2">No blogs found</h3>
          <p className="text-dark-600 text-lg">Try adjusting your search or filter criteria.</p>
        </motion.div>
      )}
    </motion.div>
  );
};

// Trending Page Component
const TrendingPage = () => {
  const [trendingBlogs, setTrendingBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrendingBlogs();
  }, []);

  const loadTrendingBlogs = async () => {
    try {
      const data = await api.getTrendingBlogs();
      setTrendingBlogs(data);
    } catch (error) {
      console.error('Error loading trending blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = (blogId, response) => {
    setTrendingBlogs(prev => prev.map(blog => 
      blog._id === blogId 
        ? { ...blog, likes: response.isLiked ? 
            [...(Array.isArray(blog.likes) ? blog.likes : []), response.userId] :
            (Array.isArray(blog.likes) ? blog.likes.filter(id => id !== response.userId) : []) 
          }
        : blog
    ));
  };

  const handleComment = (blogId, newComment) => {
    setTrendingBlogs(prev => prev.map(blog => 
      blog._id === blogId 
        ? { ...blog, comments: [...(blog.comments || []), newComment] }
        : blog
    ));
  };

  const handleRefresh = () => {
    loadTrendingBlogs();
  };

  return (
    <motion.div 
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Hero Section */}
      <motion.div 
        className="text-center mb-12 relative"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="relative z-10">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            🔥 <GradientText className="text-shadow-lg">Trending</GradientText> Blogs
          </motion.h1>
          <motion.p 
            className="text-lg text-dark-600 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Discover the hottest content in our community, ranked by engagement and popularity
          </motion.p>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" />
        <div className="absolute top-10 right-1/4 w-32 h-32 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: '2s' }} />
      </motion.div>

      {/* Trending Blogs */}
      <AnimatePresence>
        {loading ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <ModernSkeleton className="h-80 p-6" lines={8} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {trendingBlogs.map((blog, index) => (
              <motion.div
                key={blog._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                {/* Trending Badge */}
                <motion.div
                  className="absolute -top-2 -left-2 z-10"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + (index * 0.1) }}
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    #{index + 1}
                  </div>
                </motion.div>
                
                <BlogCard 
                  blog={blog} 
                  onLike={handleLike}
                  onComment={handleComment}
                  onRefresh={handleRefresh}
                  onBlogClick={onBlogClick}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {trendingBlogs.length === 0 && !loading && (
        <motion.div 
          className="text-center py-16"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="floating-element"
            whileHover={{ scale: 1.1 }}
          >
            <TrendingUp className="w-20 h-20 text-orange-300 mx-auto mb-6" />
          </motion.div>
          <h3 className="text-2xl font-bold text-dark-900 mb-2">No trending blogs yet</h3>
          <p className="text-dark-600 text-lg">Be the first to create engaging content!</p>
        </motion.div>
      )}
    </motion.div>
  );
};

// Create Blog Component
const CreateBlog = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'Technology',
    tags: '',
    featuredImage: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = ['Technology', 'Programming', 'Web Development', 'Mobile Development', 'AI/ML', 'DevOps', 'Design', 'Other'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const blogData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      await api.createBlog(blogData);
      setFormData({
        title: '',
        content: '',
        excerpt: '',
        category: 'Technology',
        tags: '',
        featuredImage: ''
      });
      onSuccess && onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to create blog');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Create New Blog Post
        </h1>
        <p className="text-gray-600">
          Share your knowledge and insights with the developer community
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your blog title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Excerpt
          </label>
          <textarea
            value={formData.excerpt}
            onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Brief description of your blog post"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content *
          </label>
          <textarea
            required
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
            rows="15"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Write your blog content here..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="javascript, react, tutorial (comma separated)"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Featured Image URL
          </label>
          <input
            type="url"
            value={formData.featuredImage}
            onChange={(e) => setFormData({...formData, featuredImage: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => setFormData({
              title: '',
              content: '',
              excerpt: '',
              category: 'Technology',
              tags: '',
              featuredImage: ''
            })}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            {loading ? 'Publishing...' : 'Publish Blog'}
          </button>
        </div>
      </form>
    </div>
  );
};

// User Profile Component
const UserProfile = () => {
  const [userBlogs, setUserBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBlog, setEditingBlog] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadUserBlogs();
  }, []);

  const loadUserBlogs = async () => {
    try {
      const data = await api.getUserBlogs();
      setUserBlogs(data.blogs);
    } catch (error) {
      console.error('Error loading user blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (blog) => {
    setEditingBlog({
      id: blog._id,
      title: blog.title,
      content: blog.content,
      excerpt: blog.excerpt,
      category: blog.category,
      tags: blog.tags.join(', '),
      featuredImage: blog.featuredImage
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      const blogData = {
        ...editingBlog,
        tags: editingBlog.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };
      delete blogData.id;
      
      await api.updateBlog(editingBlog.id, blogData);
      setShowEditModal(false);
      setEditingBlog(null);
      loadUserBlogs(); // Refresh the list
      alert('Blog updated successfully!');
    } catch (error) {
      alert(`Failed to update blog: ${error.message}`);
    }
  };

  const handleDelete = async (blogId, blogTitle) => {
    if (window.confirm(`Are you sure you want to delete "${blogTitle}"? This action cannot be undone.`)) {
      try {
        await api.deleteBlog(blogId);
        setUserBlogs(prev => prev.filter(blog => blog._id !== blogId));
        alert('Blog deleted successfully!');
      } catch (error) {
        alert(`Failed to delete blog: ${error.message}`);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'hidden': return 'text-gray-600 bg-gray-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          My Profile
        </h1>
        <p className="text-gray-600">
          Manage your blog posts and track their status
        </p>
      </div>

      {/* Stats Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <StatsCard
          title="Total Blogs"
          value={userBlogs.length}
          icon={BookOpen}
          color="primary"
        />
        
        <StatsCard
          title="Approved"
          value={userBlogs.filter(blog => blog.status === 'approved').length}
          icon={Check}
          color="green"
        />
        
        <StatsCard
          title="Pending"
          value={userBlogs.filter(blog => blog.status === 'pending').length}
          icon={() => <div className="w-6 h-6 bg-yellow-500 rounded-full" />}
          color="yellow"
        />
        
        <StatsCard
          title="Total Likes"
          value={userBlogs.reduce((total, blog) => total + (Array.isArray(blog.likes) ? blog.likes.length : blog.likes || 0), 0)}
          icon={Heart}
          color="red"
        />
      </motion.div>

      {/* Blog List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">My Blog Posts</h2>
        </div>
        
        {loading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : userBlogs.length === 0 ? (
          <div className="p-6 text-center">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts yet</h3>
            <p className="text-gray-500">Start writing your first blog post!</p>
          </div>
        ) : (
          <div className="divide-y">
            {userBlogs.map((blog) => (
              <div key={blog._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {blog.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                      <div className="flex items-center">
                        <Heart className="w-4 h-4 mr-1" />
                        {Array.isArray(blog.likes) ? blog.likes.length : blog.likes || 0}
                      </div>
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {blog.views || 0}
                      </div>
                      <div className="flex items-center">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        {Array.isArray(blog.comments) ? blog.comments.length : blog.comments || 0}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(blog.status)}`}>
                      {blog.status}
                    </span>
                    <div className="flex items-center space-x-2">
                      {['pending', 'rejected', 'draft'].includes(blog.status) && (
                        <button 
                          onClick={() => handleEdit(blog)}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit blog"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(blog._id, blog.title)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete blog"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingBlog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Edit Blog Post</h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingBlog.title}
                  onChange={(e) => setEditingBlog({...editingBlog, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt
                </label>
                <textarea
                  value={editingBlog.excerpt}
                  onChange={(e) => setEditingBlog({...editingBlog, excerpt: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  required
                  value={editingBlog.content}
                  onChange={(e) => setEditingBlog({...editingBlog, content: e.target.value})}
                  rows="15"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    required
                    value={editingBlog.category}
                    onChange={(e) => setEditingBlog({...editingBlog, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {['Technology', 'Programming', 'Web Development', 'Mobile Development', 'AI/ML', 'DevOps', 'Design', 'Other'].map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={editingBlog.tags}
                    onChange={(e) => setEditingBlog({...editingBlog, tags: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="javascript, react, tutorial (comma separated)"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Featured Image URL
                </label>
                <input
                  type="url"
                  value={editingBlog.featuredImage}
                  onChange={(e) => setEditingBlog({...editingBlog, featuredImage: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingBlog(null);
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Check className="w-4 h-4 mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Admin Dashboard Component
const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalBlogs: 0,
    pendingBlogs: 0,
    approvedBlogs: 0,
    totalUsers: 0
  });
  const [pendingBlogs, setPendingBlogs] = useState([]);
  const [allBlogs, setAllBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load real dashboard data
      const dashboardData = await api.getAdminDashboard();
      setStats(dashboardData.stats);
      setPendingBlogs(dashboardData.recentBlogs);
      
      // Load all blogs for admin
      const allBlogsData = await api.getAdminBlogs(1, 'all');
      setAllBlogs(allBlogsData.blogs);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Fallback to mock data if API fails
      const mockStats = {
        totalBlogs: 0,
        pendingBlogs: 0,
        approvedBlogs: 0,
        totalUsers: 0
      };
      setStats(mockStats);
      setPendingBlogs([]);
      setAllBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBlogAction = async (blogId, action, feedback = '') => {
    try {
      // Call real API based on action
      if (action === 'approved') {
        await api.approveBlog(blogId);
      } else if (action === 'rejected') {
        await api.rejectBlog(blogId, feedback);
      }
      
      // Update local state
      setPendingBlogs(prev => prev.filter(blog => blog._id !== blogId));
      setAllBlogs(prev => prev.map(blog => 
        blog._id === blogId 
          ? { ...blog, status: action, adminFeedback: feedback }
          : blog
      ));

      // Update stats
      setStats(prev => ({
        ...prev,
        pendingBlogs: prev.pendingBlogs - 1,
        approvedBlogs: action === 'approved' ? prev.approvedBlogs + 1 : prev.approvedBlogs
      }));
    } catch (error) {
      console.error(`Error ${action} blog:`, error);
      alert(`Failed to ${action} blog: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Manage blog posts and monitor platform activity
        </p>
      </div>

      {/* Navigation Tabs */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <GlassCard className="p-1">
          <nav className="flex space-x-1">
            {[
              { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { key: 'pending', label: `Pending (${stats.pendingBlogs})`, icon: () => <div className="w-4 h-4 bg-yellow-500 rounded-full" /> },
              { key: 'all', label: 'All Blogs', icon: BookOpen }
            ].map(({ key, label, icon: Icon }) => (
              <motion.button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`
                  flex items-center px-6 py-3 text-sm font-medium rounded-lg transition-all duration-300
                  ${activeTab === key
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                    : 'text-dark-600 hover:bg-glass-200 hover:text-primary-600'
                  }
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </motion.button>
            ))}
          </nav>
        </GlassCard>
      </motion.div>

      {/* Dashboard Overview */}
      {activeTab === 'dashboard' && (
        <>
          {/* Stats Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <StatsCard
              title="Total Blogs"
              value={stats.totalBlogs}
              icon={BookOpen}
              color="primary"
            />
            
            <StatsCard
              title="Pending Approval"
              value={stats.pendingBlogs}
              icon={() => <div className="w-6 h-6 bg-yellow-500 rounded-full" />}
              color="yellow"
            />
            
            <StatsCard
              title="Approved"
              value={stats.approvedBlogs}
              icon={Check}
              color="green"
            />
            
            <StatsCard
              title="Total Users"
              value={stats.totalUsers}
              icon={Users}
              color="purple"
            />
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <GlassCard>
              <div className="p-6 border-b border-white/20">
                <GradientText className="text-lg font-semibold">Recent Blog Submissions</GradientText>
              </div>
              <div className="divide-y divide-white/10">
                {pendingBlogs.slice(0, 5).map((blog, index) => (
                  <motion.div 
                    key={blog._id} 
                    className="p-6 hover:bg-glass-100 transition-all duration-300"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-dark-900 mb-1">{blog.title}</h3>
                        <div className="flex items-center text-sm text-dark-500">
                          <div className="w-6 h-6 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full flex items-center justify-center mr-2">
                            <User className="w-3 h-3 text-white" />
                          </div>
                          <span className="font-medium">{blog.author.username}</span>
                          <span className="mx-2 text-dark-300">•</span>
                          <Calendar className="w-3 h-3 mr-1" />
                          <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 ml-6">
                        <ModernButton
                          onClick={() => handleBlogAction(blog._id, 'approved')}
                          variant="success"
                          size="sm"
                          icon={Check}
                        >
                          Approve
                        </ModernButton>
                        <ModernButton
                          onClick={() => handleBlogAction(blog._id, 'rejected', 'Please revise content')}
                          variant="danger"
                          size="sm"
                          icon={X}
                        >
                          Reject
                        </ModernButton>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {pendingBlogs.length === 0 && (
                  <motion.div 
                    className="p-12 text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <motion.div
                      className="floating-element"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Check className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-dark-900 mb-2">All caught up!</h3>
                    <p className="text-dark-600">No blogs pending approval at the moment.</p>
                  </motion.div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        </>
      )}

      {/* Pending Blogs */}
      {activeTab === 'pending' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <GlassCard>
            <div className="p-6 border-b border-white/20">
              <GradientText className="text-lg font-semibold">Blogs Pending Approval</GradientText>
            </div>
            {pendingBlogs.length === 0 ? (
              <motion.div 
                className="p-12 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                <motion.div
                  className="floating-element"
                  whileHover={{ scale: 1.1 }}
                >
                  <Check className="w-16 h-16 text-green-400 mx-auto mb-4" />
                </motion.div>
                <h3 className="text-xl font-semibold text-dark-900 mb-2">All caught up!</h3>
                <p className="text-dark-600">No blogs pending approval at the moment.</p>
              </motion.div>
            ) : (
              <div className="divide-y divide-white/10">
                {pendingBlogs.map((blog, index) => (
                  <motion.div 
                    key={blog._id} 
                    className="p-6 hover:bg-glass-100 transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-dark-900 mb-2">{blog.title}</h3>
                        <div className="flex items-center text-sm text-dark-500 mb-4">
                          <div className="w-6 h-6 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full flex items-center justify-center mr-2">
                            <User className="w-3 h-3 text-white" />
                          </div>
                          <span className="font-medium">{blog.author.username}</span>
                          <span className="mx-2 text-dark-300">•</span>
                          <span>{blog.author.email}</span>
                          <span className="mx-2 text-dark-300">•</span>
                          <Calendar className="w-3 h-3 mr-1" />
                          <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="text-dark-600 text-sm bg-glass-100 p-4 rounded-xl">
                          <p>Preview of blog content would go here...</p>
                        </div>
                      </div>
                      <div className="ml-6 flex flex-col space-y-3">
                        <ModernButton
                          onClick={() => handleBlogAction(blog._id, 'approved')}
                          variant="success"
                          size="sm"
                          icon={Check}
                        >
                          Approve
                        </ModernButton>
                        <ModernButton
                          onClick={() => {
                            const feedback = prompt('Rejection reason (optional):');
                            handleBlogAction(blog._id, 'rejected', feedback || '');
                          }}
                          variant="danger"
                          size="sm"
                          icon={X}
                        >
                          Reject
                        </ModernButton>
                        <ModernButton
                          variant="secondary"
                          size="sm"
                          icon={Eye}
                        >
                          View Full
                        </ModernButton>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>
      )}

      {/* All Blogs */}
      {activeTab === 'all' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <GlassCard>
            <div className="p-6 border-b border-white/20">
              <GradientText className="text-lg font-semibold">All Blog Posts</GradientText>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {allBlogs.map((blog, index) => (
                    <motion.tr 
                      key={blog._id}
                      className="hover:bg-glass-100 transition-all duration-300"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-dark-900">{blog.title}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-dark-700">
                          <div className="w-6 h-6 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full flex items-center justify-center mr-2">
                            <User className="w-3 h-3 text-white" />
                          </div>
                          {blog.author.username}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <ModernBadge 
                          variant={blog.status === 'approved' ? 'success' : 
                                  blog.status === 'pending' ? 'warning' :
                                  blog.status === 'rejected' ? 'danger' : 'secondary'}
                          size="sm"
                        >
                          {blog.status}
                        </ModernBadge>
                      </td>
                      <td className="px-6 py-4 text-sm text-dark-500">
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex space-x-3">
                          {blog.status === 'approved' && (
                            <ModernButton
                              onClick={() => handleBlogAction(blog._id, 'hidden')}
                              variant="warning"
                              size="xs"
                            >
                              Hide
                            </ModernButton>
                          )}
                          <ModernButton
                            variant="danger"
                            size="xs"
                            icon={Trash2}
                          >
                            Delete
                          </ModernButton>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {allBlogs.length === 0 && (
              <motion.div 
                className="p-12 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                <motion.div
                  className="floating-element"
                  whileHover={{ scale: 1.1 }}
                >
                  <BookOpen className="w-16 h-16 text-dark-300 mx-auto mb-4" />
                </motion.div>
                <h3 className="text-xl font-semibold text-dark-900 mb-2">No blog posts found</h3>
                <p className="text-dark-600">Blog posts will appear here once they are submitted.</p>
              </motion.div>
            )}
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
};

// Main App Component
const App = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('home');
  const [blogDetailId, setBlogDetailId] = useState(null);

  const handleLoginSuccess = () => {
    setCurrentView('home');
  };

  const handleBlogCreateSuccess = () => {
    setCurrentView('profile');
  };

  const renderCurrentView = () => {
    if (!user && currentView !== 'home' && currentView !== 'trending') {
      return <LoginForm onSuccess={handleLoginSuccess} />;
    }

    if (blogDetailId) {
      return <BlogDetail blogId={blogDetailId} />;
    }
    switch (currentView) {
      case 'home':
        return <HomePage onBlogClick={setBlogDetailId} />;
      case 'trending':
        return <TrendingPage onBlogClick={setBlogDetailId} />;
      case 'create':
        return <CreateBlog onSuccess={handleBlogCreateSuccess} />;
      case 'profile':
        return <UserProfile onBlogClick={setBlogDetailId} />;
      case 'admin':
        return user?.role === 'admin' ? <AdminDashboard onBlogClick={setBlogDetailId} /> : <HomePage onBlogClick={setBlogDetailId} />;
      case 'login':
        return <LoginForm onSuccess={handleLoginSuccess} />;
      default:
        return <HomePage onBlogClick={setBlogDetailId} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      <main>
        {renderCurrentView()}
      </main>
      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">DevNovate Blog Platform</h3>
            <p className="text-gray-600 mb-4">Built with MERN Stack for VIBE HACK 2025</p>
            <div className="flex justify-center space-x-6 text-sm text-gray-500">
              <button onClick={() => { setCurrentView('home'); setBlogDetailId(null); }} className="hover:text-gray-700">Home</button>
              <button onClick={() => { setCurrentView('trending'); setBlogDetailId(null); }} className="hover:text-gray-700">Trending</button>
              {user && (
                <>
                  <button onClick={() => { setCurrentView('create'); setBlogDetailId(null); }} className="hover:text-gray-700">Write</button>
                  <button onClick={() => { setCurrentView('profile'); setBlogDetailId(null); }} className="hover:text-gray-700">Profile</button>
                </>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Root App with Auth Provider
const RootApp = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/blog/:id" element={<BlogDetailPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default RootApp;