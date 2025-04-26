const express = require('express');
const {
  getDashboardStats,
  getUsers,
  updateUserRole,
  banUser,
  unbanUser,
  getPosts,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication and admin/owner role
router.use(protect);
router.use(authorize('admin', 'owner'));

// Dashboard stats
router.get('/stats', getDashboardStats);

// User management
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/ban', banUser);
router.put('/users/:id/unban', unbanUser);

// Post management
router.get('/posts', getPosts);

// Category management
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

module.exports = router;