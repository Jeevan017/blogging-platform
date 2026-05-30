import express from 'express';
import {
  getProfile,
  updateProfile,
  toggleFollow,
  getFollowers,
  getFollowing,
  searchUsers,
  changePassword,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadProfileImage } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// @route   GET /api/users/search?q=
// @desc    Search users by username
// @access  Public
// CRITICAL: Defined before GET /:id to prevent route param collision in Express
router.get('/search', searchUsers);

// @route   PUT /api/users/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', protect, changePassword);

// @route   GET /api/users/:id
// @desc    Get user profile by ID
// @access  Public
router.get('/:id', getProfile);

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private
router.put('/:id', protect, uploadProfileImage, updateProfile);

// @route   PUT /api/users/:id/follow
// @desc    Toggle follow/unfollow a user
// @access  Private
router.put('/:id/follow', protect, toggleFollow);

// @route   GET /api/users/:id/followers
// @desc    Get followers list
// @access  Public
router.get('/:id/followers', getFollowers);

// @route   GET /api/users/:id/following
// @desc    Get following list
// @access  Public
router.get('/:id/following', getFollowing);

export default router;
