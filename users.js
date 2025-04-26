const express = require('express');
const {
  getUserProfile,
  updateProfile,
  giveVouch,
  giveRep
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/:username', getUserProfile);

// Protected routes
router.put('/profile', protect, updateProfile);
router.post('/:id/vouch', protect, giveVouch);
router.post('/:id/rep', protect, giveRep);

module.exports = router;