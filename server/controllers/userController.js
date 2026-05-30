import mongoose from 'mongoose';
import User from '../models/User.js';

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Public
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'username profilePicture bio')
      .populate('following', 'username profilePicture bio')
      .lean();

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const currentUserId = req.user._id;

    // Authorization Check: Only own profile can be updated
    if (userId.toString() !== currentUserId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    const { username, bio } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Check if new username is already taken by another account
    if (username && username !== user.username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        return res.status(409).json({ message: 'Username is already taken' });
      }
      user.username = username;
    }

    if (bio !== undefined) {
      user.bio = bio;
    }

    // Cloudinary profile image check
    if (req.file) {
      user.profilePicture = req.file.path;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      profilePicture: updatedUser.profilePicture,
      bio: updatedUser.bio,
      followers: updatedUser.followers,
      following: updatedUser.following,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle follow/unfollow a user
// @route   PUT /api/users/:id/follow
// @access  Private
export const toggleFollow = async (req, res, next) => {
  const targetUserId = req.params.id;
  const currentUserId = req.user._id;

  // Cannot follow yourself
  if (targetUserId.toString() === currentUserId.toString()) {
    return res.status(400).json({ message: 'You cannot follow yourself' });
  }

  // Use MongoDB Session for transactions to ensure atomic follow/unfollow operations
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const currentUser = await User.findById(currentUserId).session(session);
    const targetUser = await User.findById(targetUserId).session(session);

    if (!targetUser || !currentUser) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'User not found' });
    }

    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      // Unfollow atomic operation
      currentUser.following.pull(targetUserId);
      targetUser.followers.pull(currentUserId);
    } else {
      // Follow atomic operation
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);
    }

    // Save both inside the session
    await currentUser.save({ session });
    await targetUser.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      isFollowing: !isFollowing,
      followersCount: targetUser.followers.length,
      followingCount: currentUser.following.length,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    // Fallback: Standalone local MongoDB installations do not support transactions/replica sets.
    // If a transaction error occurs, fallback to sequential updates.
    const isStandaloneError = 
      error.message.includes('replica set') || 
      error.codeName === 'TransactionOutcomeUnknown' || 
      error.message.includes('transaction');

    if (isStandaloneError) {
      console.warn('MongoDB environment does not support replica set transactions. Falling back to sequential updates.');
      try {
        const currentUser = await User.findById(currentUserId);
        const targetUser = await User.findById(targetUserId);

        if (!targetUser || !currentUser) {
          return res.status(404).json({ message: 'User not found' });
        }

        const isFollowing = currentUser.following.includes(targetUserId);

        if (isFollowing) {
          currentUser.following.pull(targetUserId);
          targetUser.followers.pull(currentUserId);
        } else {
          currentUser.following.push(targetUserId);
          targetUser.followers.push(currentUserId);
        }

        // Run both updates in parallel
        await Promise.all([currentUser.save(), targetUser.save()]);

        return res.status(200).json({
          isFollowing: !isFollowing,
          followersCount: targetUser.followers.length,
          followingCount: currentUser.following.length,
        });
      } catch (fallbackError) {
        return next(fallbackError);
      }
    }

    next(error);
  }
};

// @desc    Get followers list
// @route   GET /api/users/:id/followers
// @access  Public
export const getFollowers = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'username profilePicture bio')
      .lean();

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    res.status(200).json(user.followers || []);
  } catch (error) {
    next(error);
  }
};

// @desc    Get following list
// @route   GET /api/users/:id/following
// @access  Public
export const getFollowing = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('following', 'username profilePicture bio')
      .lean();

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    res.status(200).json(user.following || []);
  } catch (error) {
    next(error);
  }
};

// @desc    Search users by username
// @route   GET /api/users/search?q=
// @access  Public
export const searchUsers = async (req, res, next) => {
  try {
    const query = req.query.q || '';

    if (!query.trim()) {
      return res.status(200).json([]);
    }

    const users = await User.find(
      { username: { $regex: query, $options: 'i' } },
      'username profilePicture bio _id'
    )
      .limit(20)
      .lean();

    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user._id;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All password fields are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New password and confirm password do not match' });
    }

    // Fetch user with password selected
    const user = await User.findById(userId).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password (pre-save hook will hash it)
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};
