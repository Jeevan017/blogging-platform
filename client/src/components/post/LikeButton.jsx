import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as postService from '../../services/postService.js';
import { ROUTES } from '../../utils/constants.js';
import getErrorMessage from '../../utils/getErrorMessage.js';

const getId = (value) => (value?._id || value)?.toString();

const LikeButton = ({ postId, likes = [], currentUserId, onLikesChange, onError }) => {
  const [localLikes, setLocalLikes] = useState(likes);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setLocalLikes(likes);
  }, [likes]);

  const isLiked = localLikes.some((id) => getId(id) === getId(currentUserId));
  const likeCount = localLikes.length;

  const handleToggle = async () => {
    if (!currentUserId) return;
    if (pending) return;

    const previous = localLikes;
    const optimistic = isLiked
      ? localLikes.filter((id) => getId(id) !== getId(currentUserId))
      : [...localLikes, currentUserId];

    setLocalLikes(optimistic);
    setPending(true);

    try {
      const { likes: serverLikes } = await postService.toggleLike(postId);
      setLocalLikes(serverLikes);
      onLikesChange?.(serverLikes);
    } catch (err) {
      setLocalLikes(previous);
      onError?.(getErrorMessage(err, 'Failed to update like.'));
    } finally {
      setPending(false);
    }
  };

  if (!currentUserId) {
    return (
      <p className="like-button like-button--guest">
        {likeCount} {likeCount === 1 ? 'like' : 'likes'} &middot;{' '}
        <Link to={ROUTES.LOGIN}>Log in to like</Link>
      </p>
    );
  }

  return (
    <button
      type="button"
      className={`like-button ${isLiked ? 'like-button--active' : ''}`}
      onClick={handleToggle}
      disabled={pending}
      aria-pressed={isLiked}
    >
      {pending ? 'Updating...' : isLiked ? 'Unlike' : 'Like'} ({likeCount})
    </button>
  );
};

export default LikeButton;
