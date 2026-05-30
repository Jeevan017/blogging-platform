import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../common/Modal.jsx';
import { ROUTES } from '../../utils/constants.js';
import * as userService from '../../services/userService.js';
import { showSuccess } from '../../utils/toast.js';
import getErrorMessage from '../../utils/getErrorMessage.js';

const getAvatarUrl = (user) => {
  if (user?.profilePicture) return user.profilePicture;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'U')}&background=2563eb&color=fff&size=64`;
};

const FollowingModal = ({ isOpen, onClose, profileId, onFollowingUpdate }) => {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unfollowingId, setUnfollowingId] = useState(null);

  const loadFollowing = async () => {
    if (!isOpen || !profileId) return;
    
    setLoading(true);
    setError('');
    try {
      const data = await userService.getFollowing(profileId);
      setFollowing(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load following.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFollowing();
  }, [isOpen, profileId]);

  const handleUnfollow = async (userId) => {
    if (!confirm('Are you sure you want to unfollow this user?')) return;

    setUnfollowingId(userId);
    setError('');

    // Optimistic update
    setFollowing((prev) => {
      const newFollowing = prev.filter((u) => u._id !== userId);
      // Notify parent with user ID to remove
      if (onFollowingUpdate) {
        onFollowingUpdate(userId);
      }
      return newFollowing;
    });

    try {
      await userService.toggleFollow(userId);
      showSuccess('Unfollowed successfully');
    } catch (err) {
      // Revert optimistic update
      setFollowing((prev) => [...prev, following.find((u) => u._id === userId)]);
      // Revert by signaling reload
      if (onFollowingUpdate) {
        onFollowingUpdate(null); // Signal to reload
      }
      setError(getErrorMessage(err, 'Failed to unfollow.'));
    } finally {
      setUnfollowingId(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Following" size="lg">
      <div className="following-modal">
        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loader">
            <div className="loader__spinner"></div>
            <span className="loader__label">Loading following...</span>
          </div>
        ) : following.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state__icon">🔗</span>
            <h3 className="empty-state__title">Not following anyone yet</h3>
            <p className="empty-state__description">
              Accounts this user follows will appear here.
            </p>
          </div>
        ) : (
          <ul className="user-list-modal">
            {following.map((user) => (
              <li key={user._id} className="user-list-modal__item">
                <img
                  className="user-list-modal__avatar"
                  src={getAvatarUrl(user)}
                  alt={user.username}
                  width={48}
                  height={48}
                />
                <div className="user-list-modal__info">
                  <Link
                    className="user-list-modal__name"
                    to={ROUTES.PROFILE(user._id)}
                    onClick={onClose}
                  >
                    {user.username}
                  </Link>
                  {user.bio && (
                    <p className="user-list-modal__bio">{user.bio}</p>
                  )}
                </div>
                <div className="user-list-modal__actions">
                  <Link
                    className="btn btn--secondary btn--sm"
                    to={ROUTES.PROFILE(user._id)}
                    onClick={onClose}
                  >
                    View Profile
                  </Link>
                  <button
                    type="button"
                    className={`btn btn--danger btn--sm${unfollowingId === user._id ? ' btn--loading' : ''}`}
                    onClick={() => handleUnfollow(user._id)}
                    disabled={unfollowingId === user._id}
                    aria-busy={unfollowingId === user._id}
                  >
                    {unfollowingId === user._id ? 'Unfollowing...' : 'Unfollow'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
};

export default FollowingModal;
