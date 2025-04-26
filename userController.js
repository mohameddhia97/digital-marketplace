const User = require('../models/User');

// @desc    Get user profile by username
// @route   GET /api/users/:username
// @access  Public
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        profile: user.profile,
        role: user.role,
        reputation: user.reputation,
        vouches: user.vouches,
        postCount: user.postCount,
        createdAt: user.createdAt,
        lastActive: user.lastActive
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { bio, customUrl, email, avatar } = req.body;
    
    // Check if customUrl is already taken by another user
    if (customUrl) {
      const existingUser = await User.findOne({
        'profile.customUrl': customUrl,
        _id: { $ne: req.user.id }
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Custom URL is already taken'
        });
      }
    }
    
    // Check if email is already taken by another user
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: req.user.id }
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken'
        });
      }
    }
    
    // Update user profile
    const user = await User.findById(req.user.id);
    
    // Update email if provided
    if (email) {
      user.email = email;
    }
    
    // Update profile fields
    user.profile.bio = bio || user.profile.bio;
    user.profile.customUrl = customUrl || user.profile.customUrl;
    
    // Update avatar if provided
    if (avatar) {
      user.profile.avatar = avatar;
    }
    
    await user.save();
    
    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Give vouch to a user
// @route   POST /api/users/:id/vouch
// @access  Private
exports.giveVouch = async (req, res) => {
  try {
    // Check if user exists
    const userToVouch = await User.findById(req.params.id);
    
    if (!userToVouch) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user is trying to vouch themselves
    if (req.user.id === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot vouch yourself'
      });
    }
    
    // Check if user has already vouched this user
    if (userToVouch.vouches.received.some(id => id.toString() === req.user.id)) {
      // Remove vouch (toggle)
      userToVouch.vouches.received = userToVouch.vouches.received.filter(
        id => id.toString() !== req.user.id
      );
      
      const currentUser = await User.findById(req.user.id);
      currentUser.vouches.given = currentUser.vouches.given.filter(
        id => id.toString() !== req.params.id
      );
      
      await currentUser.save();
    } else {
      // Add vouch
      userToVouch.vouches.received.push(req.user.id);
      
      const currentUser = await User.findById(req.user.id);
      currentUser.vouches.given.push(req.params.id);
      
      await currentUser.save();
    }
    
    await userToVouch.save();
    
    res.status(200).json({
      success: true,
      vouches: userToVouch.vouches
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Give reputation to a user
// @route   POST /api/users/:id/rep
// @access  Private
exports.giveRep = async (req, res) => {
  try {
    // Check if user exists
    const userToRep = await User.findById(req.params.id);
    
    if (!userToRep) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user is trying to rep themselves
    if (req.user.id === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot give reputation to yourself'
      });
    }
    
    // Increment reputation
    userToRep.reputation += 1;
    await userToRep.save();
    
    res.status(200).json({
      success: true,
      reputation: userToRep.reputation
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};