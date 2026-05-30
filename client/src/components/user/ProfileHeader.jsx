import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants.js';
import sanitizeHtml from '../../utils/sanitizeHtml.js';
import FollowButton from './FollowButton.jsx';

const getAvatarUrl = (profile) => {
  if (profile?.profilePicture) return profile.profilePicture;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.username || 'U')}&background=2563eb&color=fff&size=128`;
};

const ProfileHeader = ({
  profile,
  isOwnProfile,
  isFollowing,
  followersCount,
  followingCount,
  postsCount,
  likesReceived,
  joinedDate,
  currentUserId,
  onOptimisticFollow,
  onFollowChange,
  onFollowError,
  onFollowersClick,
  onFollowingClick,
}) => {
  return (
    <header className="profile-header">
      <div className="profile-header__hero">
        <div className="profile-header__avatar-card">
          <img
            className="profile-header__avatar"
            src={getAvatarUrl(profile)}
            alt={`${profile.username}'s profile`}
            width={128}
            height={128}
          />
        </div>

        <div className="profile-header__info">
          <div>
            <p className="eyebrow">Creator profile</p>
            <h1>{profile.username}</h1>
            <p className="profile-header__bio">
              {profile.bio ? sanitizeHtml(profile.bio) : 'No bio yet. Share your story and engage with readers.'}
            </p>
          </div>

          {joinedDate && <p className="profile-header__joined">Joined {joinedDate}</p>}

          <div className="profile-header__actions">
            {isOwnProfile ? (
              <Link className="btn btn--secondary" to={ROUTES.PROFILE_EDIT}>
                Edit Profile
              </Link>
            ) : (
              <FollowButton
                userId={profile._id}
                currentUserId={currentUserId}
                isFollowing={isFollowing}
                onOptimisticChange={onOptimisticFollow}
                onFollowChange={onFollowChange}
                onError={onFollowError}
              />
            )}
          </div>
        </div>
      </div>

      <div className="profile-header__stats" role="group" aria-label="Profile statistics">
        <div className="stat-card">
          <span className="stat-card__value">{postsCount}</span>
          <span className="stat-card__label">Posts</span>
        </div>
        <button
          type="button"
          className="stat-card stat-card--clickable"
          onClick={onFollowersClick}
          aria-label={`View ${followersCount} followers`}
        >
          <span className="stat-card__value">{followersCount}</span>
          <span className="stat-card__label">Followers</span>
        </button>
        <button
          type="button"
          className="stat-card stat-card--clickable"
          onClick={onFollowingClick}
          aria-label={`View ${followingCount} following`}
        >
          <span className="stat-card__value">{followingCount}</span>
          <span className="stat-card__label">Following</span>
        </button>
        <div className="stat-card">
          <span className="stat-card__value">{likesReceived}</span>
          <span className="stat-card__label">Likes received</span>
        </div>
      </div>
    </header>
  );
};

export default ProfileHeader;
