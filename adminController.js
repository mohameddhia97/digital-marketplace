const User = require('../models/User');
const Post = require('../models/Post');
const Category = require('../models/Category');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    // Get user stats
    const totalUsers = await User.countDocuments();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const newUsersToday = await User.countDocuments({ createdAt: { $gte: todayStart } });
    
    // Get active users (active in last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeUsers = await User.countDocuments({ lastActive: { $gte: yesterday } });
    
    // Get post stats
    const totalPosts = await Post.countDocuments();
    const newPostsToday = await Post.countDocuments({ createdAt: { $gte: todayStart } });
    
    // Get category stats
    const totalCategories = await Category.countDocuments();
    
    // Get reply stats (sum of all replies across posts)
    const posts = await Post.find({}, 'replies');
    const totalReplies = posts.reduce((sum, post) => sum + (post.replies?.length || 0), 0);
    
    const stats = {
      totalUsers,
      newUsersToday,
      activeUsers,
      totalPosts,
      newPostsToday,
      totalCategories,
      totalReplies
    };
    
    res.status(200).json({
      success: true,
      stats
    });
  } catch (err) {
    console.error('Error getting admin stats:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while getting dashboard stats'
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'trusted', 'moderator', 'admin', 'owner'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Ban user
// @route   PUT /api/admin/users/:id/ban
// @access  Private/Admin
exports.banUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Unban user
// @route   PUT /api/admin/users/:id/unban
// @access  Private/Admin
exports.unbanUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all posts
// @route   GET /api/admin/posts
// @access  Private/Admin
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username profile.avatar')
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: posts.length,
      posts
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all categories
// @route   GET /api/admin/categories
// @access  Private/Admin
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1 });
    
    res.status(200).json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create category
// @route   POST /api/admin/categories
// @access  Private/Admin
exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    
    res.status(201).json({
      success: true,
      category
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update category
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.status(200).json({
      success: true,
      category
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    await category.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Category deleted'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};