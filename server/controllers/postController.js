import Post from '../models/Post.js';

// @desc    Get all posts (paginated, searchable)
// @route   GET /api/posts
// @access  Public
export const getPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    // Search query construction
    let query = {};
    if (search) {
      // Use regex search on title and tags for partial case-insensitive matching
      query = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const totalPosts = await Post.countDocuments(query);
    const totalPages = Math.ceil(totalPosts / limit);

    // Fetch and populate posts. Using .lean() for read-only queries performance
    const posts = await Post.find(query)
      .populate('author', 'username profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      posts,
      currentPage: page,
      totalPages,
      totalPosts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Public
export const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username profilePicture')
      .lean();

    if (!post) {
      res.status(404);
      throw new Error('Post not found');
    }

    res.status(200).json(post);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res, next) => {
  try {
    const { title, content, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    // Process tags (accept either array or comma-separated string)
    let processedTags = [];
    if (tags) {
      if (Array.isArray(tags)) {
        processedTags = tags.map(tag => tag.trim());
      } else if (typeof tags === 'string') {
        processedTags = tags.split(',').map(tag => tag.trim()).filter(Boolean);
      }
    }

    // Cloudinary URL from uploadMiddleware is located in req.file.path
    const image = req.file ? req.file.path : '';

    const post = await Post.create({
      title,
      content,
      image,
      tags: processedTags,
      author: req.user._id,
    });

    const populatedPost = await Post.findById(post._id).populate('author', 'username profilePicture');

    res.status(201).json(populatedPost);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private
export const updatePost = async (req, res, next) => {
  try {
    const { title, content, tags } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404);
      throw new Error('Post not found');
    }

    // Authorization: Only owner can update.
    // Return 403 for authenticated but not authorized.
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    post.title = title || post.title;
    post.content = content || post.content;

    if (tags) {
      if (Array.isArray(tags)) {
        post.tags = tags.map(tag => tag.trim());
      } else if (typeof tags === 'string') {
        post.tags = tags.split(',').map(tag => tag.trim()).filter(Boolean);
      }
    }

    if (req.file) {
      post.image = req.file.path;
    }

    const updatedPost = await post.save();
    const populatedPost = await Post.findById(updatedPost._id).populate('author', 'username profilePicture');

    res.status(200).json(populatedPost);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404);
      throw new Error('Post not found');
    }

    // Authorization: Only owner can delete.
    // Return 403 for authenticated but not authorized.
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();
    res.status(200).json({ message: 'Post removed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle like / unlike a post
// @route   PUT /api/posts/:id/like
// @access  Private
export const toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404);
      throw new Error('Post not found');
    }

    const userLikedIndex = post.likes.indexOf(req.user._id);

    if (userLikedIndex > -1) {
      // Already liked, so unlike
      post.likes.splice(userLikedIndex, 1);
    } else {
      // Not liked, so like
      post.likes.push(req.user._id);
    }

    await post.save();
    res.status(200).json({ likes: post.likes });
  } catch (error) {
    next(error);
  }
};

// @desc    Get posts written by a specific user
// @route   GET /api/posts/user/:userId
// @access  Public
export const getPostsByUser = async (req, res, next) => {
  try {
    const posts = await Post.find({ author: req.params.userId })
      .populate('author', 'username profilePicture')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
};
