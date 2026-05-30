import { useEffect, useState } from 'react';
import * as userService from '../../services/userService.js';
import getErrorMessage from '../../utils/getErrorMessage.js';
import { showSuccess } from '../../utils/toast.js';

const FollowButton = ({
  userId,
  currentUserId,
  isFollowing,
  onOptimisticChange,
  onFollowChange,
  onError,
}) => {
  const [following, setFollowing] = useState(isFollowing);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setFollowing(isFollowing);
  }, [isFollowing]);

  // Safely compare IDs (handle ObjectId vs string)
  const isSameUser = (() => {
    if (!currentUserId || !userId) return false;
    try {
      return userId.toString() === currentUserId.toString();
    } catch {
      return false;
    }
  })();

  if (!currentUserId || isSameUser) {
    return null;
  }

  const handleToggle = async () => {
    if (pending) return;

    const previousFollowing = following;
    const nextFollowing = !following;

    setFollowing(nextFollowing);
    onOptimisticChange?.(nextFollowing);
    setPending(true);

    try {
      const result = await userService.toggleFollow(userId);
      setFollowing(result.isFollowing);
      onFollowChange?.(result);
      showSuccess(result.isFollowing ? 'You are now following this user' : 'Unfollowed successfully');
    } catch (err) {
      setFollowing(previousFollowing);
      onOptimisticChange?.(previousFollowing);
      onError?.(getErrorMessage(err, 'Failed to update follow status.'));
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      className={`follow-button${following ? ' follow-button--active' : ''}`}
      onClick={handleToggle}
      disabled={pending}
      aria-pressed={following}
      aria-busy={pending}
    >
      {pending ? 'Updating...' : following ? 'Unfollow' : 'Follow'}
    </button>
  );
};

export default FollowButton;
