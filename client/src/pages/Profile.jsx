import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import ProfileSkeleton from '../components/common/ProfileSkeleton.jsx';
import PageMeta from '../components/seo/PageMeta.jsx';
import PostCard from '../components/post/PostCard.jsx';
import ProfileHeader from '../components/user/ProfileHeader.jsx';
import FollowersModal from '../components/user/FollowersModal.jsx';
import FollowingModal from '../components/user/FollowingModal.jsx';
import useAuth from '../hooks/useAuth.js';
import * as postService from '../services/postService.js';
import * as userService from '../services/userService.js';
import { ROUTES } from '../utils/constants.js';
import getAppUrl from '../utils/getAppUrl.js';
import getErrorMessage from '../utils/getErrorMessage.js';
import formatDate from '../utils/formatDate.js';
import sanitizeHtml from '../utils/sanitizeHtml.js';
import { isProfileOwner } from '../utils/ownership.js';

const getId = (value) => (value?._id || value)?.toString();

const Profile = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [followError, setFollowError] = useState('');
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followingModalOpen, setFollowingModalOpen] = useState(false);

  const isOwnProfile = isProfileOwner(id, user?._id);

  const postsCount = useMemo(() => posts.length, [posts]);
  const likesReceived = useMemo(
    () => posts.reduce((count, post) => count + (post.likes?.length || 0), 0),
    [posts]
  );
  const joinedDate = profile?.createdAt ? formatDate(profile.createdAt) : null;

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [profileData, userPosts, followersList, followingList] = await Promise.all([
        userService.getProfile(id),
        postService.getPostsByUser(id),
        userService.getFollowers(id),
        userService.getFollowing(id),
      ]);

      setProfile(profileData);
      setPosts(userPosts);
      setFollowers(followersList);
      setFollowing(followingList);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load profile.'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const isFollowing = profile?.followers?.some(
    (follower) => getId(follower) === getId(user?._id)
  );

  const handleOptimisticFollow = (nextFollowing) => {
    if (!user) return;
    setFollowError('');

    const followerEntry = {
      _id: user._id,
      username: user.username,
      profilePicture: user.profilePicture,
    };

    setFollowers((prev) => {
      const alreadyListed = prev.some((f) => getId(f) === getId(user._id));
      if (nextFollowing && !alreadyListed) return [...prev, followerEntry];
      if (!nextFollowing) return prev.filter((f) => getId(f) !== getId(user._id));
      return prev;
    });

    setProfile((prev) => {
      if (!prev) return prev;
      const profileFollowers = prev.followers || [];
      const alreadyListed = profileFollowers.some((f) => getId(f) === getId(user._id));

      if (nextFollowing && !alreadyListed) {
        return { ...prev, followers: [...profileFollowers, followerEntry] };
      }

      if (!nextFollowing) {
        return {
          ...prev,
          followers: profileFollowers.filter((f) => getId(f) !== getId(user._id)),
        };
      }

      return prev;
    });
  };

  const handleFollowChange = () => {
    setFollowError('');
  };

  const handleFollowersUpdate = (userId) => {
    // If userId is null, reload profile data (error revert)
    if (userId === null) {
      loadProfile();
      return;
    }
    
    setProfile((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        followers: (prev.followers || []).filter((f) => getId(f) !== getId(userId)),
      };
    });
    setFollowers((prev) => prev.filter((f) => getId(f) !== getId(userId)));
  };

  const handleFollowingUpdate = (userId) => {
    // If userId is null, reload profile data (error revert)
    if (userId === null) {
      loadProfile();
      return;
    }
    
    setProfile((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        following: (prev.following || []).filter((f) => getId(f) !== getId(userId)),
      };
    });
    setFollowing((prev) => prev.filter((f) => getId(f) !== getId(userId)));
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (error || !profile) {
    return (
      <section className="profile-page">
        <ErrorMessage message={error || 'Profile not found.'} />
      </section>
    );
  }

  const followersCount = profile.followers?.length ?? 0;
  const followingCount = profile.following?.length ?? 0;

  const sanitizedBio = sanitizeHtml(profile.bio);

  return (
    <section className="profile-page">
      <PageMeta
        title={profile.username}
        description={sanitizedBio || `View ${profile.username}'s profile and posts on BlogSpace.`}
        image={profile.profilePicture}
        url={`${getAppUrl()}/profile/${profile._id}`}
      />
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        isFollowing={Boolean(isFollowing)}
        followersCount={followersCount}
        followingCount={followingCount}
        postsCount={postsCount}
        likesReceived={likesReceived}
        joinedDate={joinedDate}
        currentUserId={isAuthenticated ? user?._id : null}
        onOptimisticFollow={handleOptimisticFollow}
        onFollowChange={handleFollowChange}
        onFollowError={setFollowError}
        onFollowersClick={() => setFollowersModalOpen(true)}
        onFollowingClick={() => setFollowingModalOpen(true)}
      />

      <ErrorMessage message={followError} />

      <section className="profile-section">
        <h2>Posts</h2>
        {posts.length === 0 ? (
          <EmptyState
            icon="📝"
            title="No posts yet"
            description={
              isOwnProfile
                ? 'Share your first story with the community.'
                : `${profile.username} hasn't published any posts yet.`
            }
            action={
              isOwnProfile && (
                <Link to={ROUTES.CREATE} className="btn btn--primary">
                  Write a post
                </Link>
              )
            }
          />
        ) : (
          <div className="post-grid">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </section>

      {posts.length > 0 && (
        <section className="profile-section">
          <h2>Recent activity</h2>
          <div className="activity-list">
            {posts.slice(0, 4).map((post) => (
              <Link key={post._id} to={ROUTES.POST(post._id)}>
                <strong>{post.title}</strong>
                <span>{formatDate(post.createdAt)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="profile-section">
        <h2>Followers</h2>
        {followers.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No followers yet"
            description="When people follow this profile, they'll appear here."
          />
        ) : (
          <ul className="user-list" aria-label="Followers list">
            {followers.map((follower) => (
              <li key={follower._id}>
                <Link to={ROUTES.PROFILE(follower._id)}>{follower.username}</Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="profile-section">
        <h2>Following</h2>
        {following.length === 0 ? (
          <EmptyState
            icon="🔗"
            title="Not following anyone yet"
            description="Accounts this user follows will appear here."
          />
        ) : (
          <ul className="user-list" aria-label="Following list">
            {following.map((followed) => (
              <li key={followed._id}>
                <Link to={ROUTES.PROFILE(followed._id)}>{followed.username}</Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <FollowersModal
        isOpen={followersModalOpen}
        onClose={() => setFollowersModalOpen(false)}
        profileId={id}
        isOwnProfile={isOwnProfile}
        onFollowersUpdate={handleFollowersUpdate}
      />

      <FollowingModal
        isOpen={followingModalOpen}
        onClose={() => setFollowingModalOpen(false)}
        profileId={id}
        onFollowingUpdate={handleFollowingUpdate}
      />
    </section>
  );
};

export default Profile;
