import express from 'express';
import { globalSearch } from '../controllers/searchController.js';

const router = express.Router();

// @route   GET /api/search?q=
// @desc    Global search across users, posts, and tags
// @access  Public
router.get('/', globalSearch);

export default router;