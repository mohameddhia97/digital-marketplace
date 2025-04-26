const Post = require('../models/Post');
const User = require('../models/User');

// @desc    Get all posts or filtered posts
// @route   GET /api/posts
// @access  Public
exports.getPosts = async (req, res) => {
  try {
    // Build query from request params
    const query = {};
    
    // Filter by category if provided
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Filter by author if provided
    if (req.query.author) {
      query.author = req.query.author;
    }
    
    // Filter by search term if provided
    if (req.query.q) {
      query.$or = [
        { title: { $regex: req.query.q, $options: 'i' } },
        { content: { $regex: req.query.q, $options: 'i' } },
        { tags: { $in: [req.query.q] } }
      ];
    }
    
    // Execute query
    let posts = await Post.find(query)
      .populate('author', 'username profile.avatar')
      .populate('category', 'name slug')
      .sort({ createdAt: -1 }); // Default sort by latest
    
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

// @desc    Get post by ID
// @route   GET /api/posts/:id
// @access  Public
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username profile.avatar')
      .populate('category', 'name slug')
      .populate('replies.user', 'username profile.avatar');
      
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Increment view count
    post.views += 1;
    await post.save();
    
    res.status(200).json({
      success: true,
      post
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res) => {
  try {
    const { title, content, category, tags, price, isFree } = req.body;
    
    // Create post
    const post = await Post.create({
      title,
      content,
      author: req.user.id,
      category,
      tags: Array.isArray(tags) ? tags : [],
      price: isFree ? 0 : price,
      isFree
    });
    
    // Update user's post count
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { postCount: 1 }
    });
    
    // Get populated post
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username profile.avatar')
      .populate('category', 'name slug');
    
    res.status(201).json({
      success: true,
      post: populatedPost
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error'
    });
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Check if user is the post author or admin
    if (post.author.toString() !== req.user.id && !['admin', 'moderator', 'owner'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post'
      });
    }
    
    // Update post
    const { title, content, category, tags, price, isFree } = req.body;
    
    post.title = title || post.title;
    post.content = content || post.content;
    post.category = category || post.category;
    post.tags = tags || post.tags;
    post.price = isFree ? 0 : (price || post.price);
    post.isFree = isFree !== undefined ? isFree : post.isFree;
    post.updatedAt = Date.now();
    
    await post.save();
    
    // Get populated post
    const updatedPost = await Post.findById(post._id)
      .populate('author', 'username profile.avatar')
      .populate('category', 'name slug');
    
    res.status(200).json({
      success: true,
      post: updatedPost
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Check if user is the post author or admin
    if (post.author.toString() !== req.user.id && !['admin', 'moderator', 'owner'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }
    
    await post.deleteOne();
    
    // Decrement user's post count
    await User.findByIdAndUpdate(post.author, {
      $inc: { postCount: -1 }
    });
    
    res.status(200).json({
      success: true,
      message: 'Post deleted'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Like/unlike post
// @route   POST /api/posts/:id/like
// @access  Private
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Check if user has already liked the post
    const alreadyLiked = post.likes.includes(req.user.id);
    
    if (alreadyLiked) {
      // Unlike post
      post.likes = post.likes.filter(like => like.toString() !== req.user.id);
    } else {
      // Like post
      post.likes.push(req.user.id);
    }
    
    await post.save();
    
    res.status(200).json({
      success: true,
      likes: post.likes
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Add reply to post
// @route   POST /api/posts/:id/replies
// @access  Private
exports.addReply = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Add reply
    post.replies.push({
      user: req.user.id,
      content: req.body.content,
      createdAt: Date.now()
    });
    
    await post.save();
    
    // Get populated post with replies
    const updatedPost = await Post.findById(post._id)
      .populate('replies.user', 'username profile.avatar');
    
    res.status(200).json({
      success: true,
      replies: updatedPost.replies
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Like/unlike reply
// @route   POST /api/posts/:id/replies/:replyId/like
// @access  Private
exports.likeReply = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Find reply
    const reply = post.replies.id(req.params.replyId);
    
    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found'
      });
    }
    
    // Check if user has already liked the reply
    const alreadyLiked = reply.likes.includes(req.user.id);
    
    if (alreadyLiked) {
      // Unlike reply
      reply.likes = reply.likes.filter(like => like.toString() !== req.user.id);
    } else {
      // Like reply
      reply.likes.push(req.user.id);
    }
    
    await post.save();
    
    res.status(200).json({
      success: true,
      likes: reply.likes
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};