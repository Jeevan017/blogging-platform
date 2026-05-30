import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import PageMeta from '../components/seo/PageMeta.jsx';
import LikeButton from '../components/post/LikeButton.jsx';
import useAuth from '../hooks/useAuth.js';
import * as postService from '../services/postService.js';
import { ROUTES } from '../utils/constants.js';
import formatDate from '../utils/formatDate.js';
import getErrorMessage from '../utils/getErrorMessage.js';
import { isPostOwner } from '../utils/ownership.js';
import getAppUrl from '../utils/getAppUrl.js';
import sanitizeHtml from '../utils/sanitizeHtml.js';
import { showSuccess } from '../utils/toast.js';

const getAvatarUrl = (author) => {
  if (author?.profilePicture) return author.profilePicture;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(author?.username || 'A')}&background=2563eb&color=fff`;
};

const SinglePostSkeleton = () => (
  <article className="single-post" aria-busy="true" aria-label="Loading post">
    <Skeleton height="320px" className="single-post__hero-skeleton" />
    <Skeleton height="40px" width="80%" />
    <Skeleton height="16px" width="40%" />
    <Skeleton height="200px" />
  </article>
);

const SinglePost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [likeError, setLikeError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const fetchPost = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await postService.getPostById(id);
      setPost(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load post.'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this post? This action cannot be undone.'
    );
    if (!confirmed) return;

    setDeleting(true);
    setError('');
    try {
      await postService.deletePost(id);
      showSuccess('Post deleted successfully');
      navigate(ROUTES.HOME, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete post.'));
      setDeleting(false);
    }
  };

  const handleLikesChange = (likes) => {
    setPost((prev) => (prev ? { ...prev, likes } : prev));
    setLikeError('');
  };

  if (loading) {
    return <SinglePostSkeleton />;
  }

  if (error && !post) {
    return (
      <section className="single-post">
        <ErrorMessage message={error} />
        <Link to={ROUTES.HOME} className="btn btn--secondary">
          Back to Home
        </Link>
      </section>
    );
  }

  if (!post) return null;

  const owner = isPostOwner(post, user?._id);
  const authorId = post.author?._id || post.author;
  const sanitizedContent = sanitizeHtml(post.content || '');

  return (
    <article className="single-post">
      {post.image && (
        <figure className="single-post__hero">
          <img className="single-post__image" src={post.image} alt={post.title} />
        </figure>
      )}

      <header className="single-post__header">
        <h1>{post.title}</h1>
        <p className="single-post__meta">Published {formatDate(post.createdAt)}</p>
      </header>

      {post.tags && post.tags.length > 0 && (
        <ul className="post-card__tags single-post__tags" aria-label="Tags">
          {post.tags.map((tag) => (
            <li key={tag} className="tag">
              #{tag}
            </li>
          ))}
        </ul>
      )}

      <div className="single-post__author-card">
        <img
          className="single-post__author-avatar"
          src={getAvatarUrl(post.author)}
          alt=""
          width={48}
          height={48}
        />
        <div>
          <span className="text-muted">Written by</span>
          <br />
          <Link className="single-post__author-name" to={ROUTES.PROFILE(authorId)}>
            {post.author && (post.author._id ? post.author.username : post.author) || 'Unknown'}
          </Link>
        </div>
      </div>

      <div className="single-post__content">{sanitizedContent}</div>

      <ErrorMessage message={likeError} />
      <LikeButton
        postId={post._id}
        likes={post.likes}
        currentUserId={isAuthenticated ? user?._id : null}
        onLikesChange={handleLikesChange}
        onError={setLikeError}
      />

      {owner && (
        <div className="single-post__actions">
          <Link className="btn btn--secondary" to={ROUTES.EDIT(post._id)}>
            Edit Post
          </Link>
          <button
            type="button"
            className={`btn btn--danger${deleting ? ' btn--loading' : ''}`}
            onClick={handleDelete}
            disabled={deleting}
            aria-busy={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete Post'}
          </button>
        </div>
      )}

      <ErrorMessage message={error} />
    </article>
  );
};

export default SinglePost;
