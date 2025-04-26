const express = require('express');
const {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
  addReply,
  likeReply
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getPosts);
router.get('/:id', getPostById);

// Protected routes
router.post('/', protect, createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, likePost);
router.post('/:id/replies', protect, addReply);
router.post('/:id/replies/:replyId/like', protect, likeReply);

module.exports = router;