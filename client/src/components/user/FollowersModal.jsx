import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../common/Modal.jsx';
import { ROUTES } from '../../utils/constants.js';
import * as userService from '../../services/userService.js';
import { showSuccess } from '../../utils/toast.js';
import getErrorMessage from '../../utils/getErrorMessage.js';
import useAuth from '../../hooks/useAuth.js';

const getAvatarUrl = (user) => {
  if (user?.profilePicture) return user.profilePicture;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'U')}&background=2563eb&color=fff&size=64`;
};

const FollowersModal = ({ isOpen, onClose, profileId, isOwnProfile, onFollowersUpdate }) => {
  const { user: currentUser } = useAuth();
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState(null);

  const loadFollowers = async () => {
    if (!isOpen || !profileId) return;
    
    setLoading(true);
    setError('');
    try {
      const data = await userService.getFollowers(profileId);
      setFollowers(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load followers.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFollowers();
  }, [isOpen, profileId]);

  const handleRemoveFollower = async (followerId) => {
    if (!confirm('Are you sure you want to remove this follower?')) return;

    setRemovingId(followerId);
    setError('');

    // Optimistic update
    setFollowers((prev) => {
      const newFollowers = prev.filter((f) => f._id !== followerId);
      // Notify parent with user ID to remove
      if (onFollowersUpdate) {
        onFollowersUpdate(followerId);
      }
      return newFollowers;
    });

    try {
      await userService.toggleFollow(followerId);
      showSuccess('Follower removed successfully');
    } catch (err) {
      // Revert optimistic update
      setFollowers((prev) => [...prev, followers.find((f) => f._id === followerId)]);
      // Revert by re-adding the user
      if (onFollowersUpdate) {
        onFollowersUpdate(null); // Signal to reload
      }
      setError(getErrorMessage(err, 'Failed to remove follower.'));
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Followers" size="lg">
      <div className="followers-modal">
        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loader">
            <div className="loader__spinner"></div>
            <span className="loader__label">Loading followers...</span>
          </div>
        ) : followers.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state__icon">👥</span>
            <h3 className="empty-state__title">No followers yet</h3>
            <p className="empty-state__description">
              When people follow this profile, they'll appear here.
            </p>
          </div>
        ) : (
          <ul className="user-list-modal">
            {followers.map((follower) => (
              <li key={follower._id} className="user-list-modal__item">
                <img
                  className="user-list-modal__avatar"
                  src={getAvatarUrl(follower)}
                  alt={follower.username}
                  width={48}
                  height={48}
                />
                <div className="user-list-modal__info">
                  <Link
                    className="user-list-modal__name"
                    to={ROUTES.PROFILE(follower._id)}
                    onClick={onClose}
                  >
                    {follower.username}
                  </Link>
                  {follower.bio && (
                    <p className="user-list-modal__bio">{follower.bio}</p>
                  )}
                </div>
                <div className="user-list-modal__actions">
                  <Link
                    className="btn btn--secondary btn--sm"
                    to={ROUTES.PROFILE(follower._id)}
                    onClick={onClose}
                  >
                    View Profile
                  </Link>
                  {isOwnProfile && (
                    <button
                      type="button"
                      className={`btn btn--danger btn--sm${removingId === follower._id ? ' btn--loading' : ''}`}
                      onClick={() => handleRemoveFollower(follower._id)}
                      disabled={removingId === follower._id}
                      aria-busy={removingId === follower._id}
                    >
                      {removingId === follower._id ? 'Removing...' : 'Remove'}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
};

export default FollowersModal;
