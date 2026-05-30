import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants.js';
import formatDate from '../../utils/formatDate.js';

const PostCard = ({ post }) => {
  const likeCount = post.likes?.length ?? 0;
  const authorName = post.author?.username ?? 'Unknown author';
  return (
    <article className="post-card">
      <Link
        to={ROUTES.POST(post._id)}
        className="post-card__link"
        aria-label={`Read post: ${post.title}`}
      >
        {post.image && (
          <div className="post-card__image-wrap">
            <img className="post-card__image" src={post.image} alt="" loading="lazy" />
          </div>
        )}

        <div className="post-card__body">
          <h2 className="post-card__title">{post.title}</h2>

          <p className="post-card__meta">
            {authorName} &middot; {formatDate(post.createdAt)}
          </p>

          {post.tags && post.tags.length > 0 && (
            <ul className="post-card__tags" aria-label="Tags">
              {post.tags.slice(0, 4).map((tag) => (
                <li key={tag}>#{tag}</li>
              ))}
            </ul>
          )}

          <div className="post-card__footer">
            <span className="post-card__likes">
              {likeCount} {likeCount === 1 ? 'like' : 'likes'}
            </span>
            <span className="post-card__read-more">Read more →</span>
          </div>
        </div>
      </Link>
    </article>
  );
};

export default memo(PostCard);
