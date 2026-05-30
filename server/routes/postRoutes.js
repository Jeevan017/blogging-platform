import express from 'express';
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  getPostsByUser,
} from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadPostImage } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// @route   GET /api/posts
// @desc    Get all posts (paginated, searchable)
// @access  Public
router.get('/', getPosts);

// @route   GET /api/posts/user/:userId
// @desc    Get posts written by a specific user
// @access  Public
// CRITICAL: Defined before GET /:id to prevent route param collision in Express
router.get('/user/:userId', getPostsByUser);

// @route   GET /api/posts/:id
// @desc    Get single post by ID
// @access  Public
router.get('/:id', getPostById);

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', protect, uploadPostImage, createPost);

// @route   PUT /api/posts/:id
// @desc    Update a post
// @access  Private
router.put('/:id', protect, uploadPostImage, updatePost);

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', protect, deletePost);

// @route   PUT /api/posts/:id/like
// @desc    Toggle like/unlike a post
// @access  Private
router.put('/:id/like', protect, toggleLike);

export default router;
