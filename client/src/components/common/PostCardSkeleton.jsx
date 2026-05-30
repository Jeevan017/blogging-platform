import Skeleton from './Skeleton.jsx';

const PostCardSkeleton = () => {
  return (
    <article className="post-card post-card--skeleton" aria-hidden="true">
      <Skeleton className="post-card__image-skeleton" height="180px" />
      <Skeleton className="post-card__title-skeleton" height="24px" width="75%" />
      <Skeleton height="14px" width="50%" />
      <div className="post-card__tags-skeleton">
        <Skeleton height="22px" width="60px" rounded />
        <Skeleton height="22px" width="72px" rounded />
      </div>
      <Skeleton height="14px" width="30%" />
    </article>
  );
};

export default PostCardSkeleton;
