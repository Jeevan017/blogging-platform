import Skeleton from './Skeleton.jsx';

const ProfileSkeleton = () => {
  return (
    <div className="profile-page" aria-busy="true" aria-label="Loading profile">
      <div className="profile-header">
        <Skeleton className="profile-header__avatar-skeleton" width="112px" height="112px" rounded />
        <div className="profile-header__info" style={{ flex: 1 }}>
          <Skeleton height="32px" width="200px" />
          <Skeleton height="16px" width="80%" />
          <div className="stat-cards">
            <Skeleton height="60px" width="100px" />
            <Skeleton height="60px" width="100px" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
