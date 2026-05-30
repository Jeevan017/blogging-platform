import Post from '../models/Post.js';
import User from '../models/User.js';

// @desc    Global search across users, posts, and tags
// @route   GET /api/search?q=
// @access  Public
export const globalSearch = async (req, res, next) => {
  try {
    const query = req.query.q || '';

    if (!query.trim()) {
      return res.status(200).json({ users: [], posts: [], tags: [] });
    }

    const searchRegex = { $regex: query, $options: 'i' };

    // Search users by username (limit 5)
    const users = await User.find(
      { username: searchRegex },
      'username profilePicture _id'
    )
      .limit(5)
      .lean();

    // Search posts by title OR content (limit 10)
    const posts = await Post.find(
      {
        $or: [
          { title: searchRegex },
          { content: searchRegex },
        ],
      },
      'title image author'
    )
      .populate('author', 'username profilePicture')
      .limit(10)
      .lean();

    // Search tags - return posts that have matching tags (limit 10)
    const tagPosts = await Post.find(
      { tags: searchRegex },
      'title image author tags'
    )
      .populate('author', 'username profilePicture')
      .limit(10)
      .lean();

    res.status(200).json({
      users,
      posts,
      tags: tagPosts,
    });
  } catch (error) {
    next(error);
  }
};