import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import PageMeta from '../components/seo/PageMeta.jsx';
import SearchBar from '../components/common/SearchBar.jsx';
import useAuth from '../hooks/useAuth.js';
import * as userService from '../services/userService.js';
import { ROUTES } from '../utils/constants.js';
import getErrorMessage from '../utils/getErrorMessage.js';

const SearchUsers = () => {
  const { user: currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const popularTags = useMemo(
    () => ['react', 'node', 'mongodb', 'productivity', 'design', 'startup'],
    []
  );

  const fetchUsers = useCallback(async (query) => {
    if (!query.trim()) {
      setUsers([]);
      setError('');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const results = await userService.searchUsers(query);
      setUsers(results);
    } catch (err) {
      setUsers([]);
      setError(getErrorMessage(err, 'Failed to search users.'));
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback(
    (term) => {
      setSearch(term);
      fetchUsers(term);
    },
    [fetchUsers]
  );

  useEffect(() => {
    const query = searchParams.get('search') || '';
    if (query.trim()) {
      setSearch(query);
      fetchUsers(query);
    }
  }, [searchParams, fetchUsers]);

  const getAvatarUrl = (profilePicture, username) => {
    if (profilePicture) return profilePicture;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(username || 'U')}&background=2563eb&color=fff&size=64`;
  };

  return (
    <section className="discover-page">
      <PageMeta
        title="Discover People"
        description="Search and discover writers, builders, and creators on BlogSpace."
      />

      <header className="discover-hero">
        <div className="discover-hero__content">
          <p className="eyebrow">Discover people</p>
          <h1>Find creators shaping the community</h1>
          <p>
            Search for authors by name, explore popular tags, and connect with writers who inspire you.
          </p>
        </div>
        <div className="discover-hero__actions">
          <SearchBar value={search} onSearch={handleSearch} placeholder="Search authors..." />
        </div>
      </header>

      <div className="discover-grid">
        <main className="discover-main">
          <ErrorMessage message={error} />

          {loading ? (
            <div className="users-grid" aria-busy="true" aria-label="Loading users">
              <p>Searching...</p>
            </div>
          ) : users.length === 0 ? (
            <EmptyState
              icon="🔎"
              title={search ? 'No users found' : 'Discover creators'}
              description={
                search
                  ? `No users match "${search}". Try a different username or keyword.`
                  : 'Use the search bar to explore authors, writers, and developer profiles.'
              }
            />
          ) : (
            <div className="users-grid">
              {users.map((user) => (
                <Link
                  key={user._id}
                  to={ROUTES.PROFILE(user._id)}
                  className="user-card"
                  aria-label={`View ${user.username}'s profile`}
                >
                  <img
                    className="user-card__avatar"
                    src={getAvatarUrl(user.profilePicture, user.username)}
                    alt={`${user.username}'s avatar`}
                    width={64}
                    height={64}
                  />
                  <h3 className="user-card__username">{user.username}</h3>
                  {user.bio && (
                    <p className="user-card__bio">{user.bio.substring(0, 100)}</p>
                  )}
                  <span className="user-card__link">View Profile →</span>
                </Link>
              ))}
            </div>
          )}
        </main>

        <aside className="discover-panel">
          <section className="discover-section">
            <h2>Popular tags</h2>
            <div className="tag-list">
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="tag-pill"
                  onClick={() => handleSearch(tag)}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </section>

          <section className="discover-section">
            <h2>Featured authors</h2>
            <p className="text-muted">Search for people who are publishing consistently and building an audience.</p>
          </section>

          <section className="discover-section">
            <h2>Getting started</h2>
            <p className="text-muted">
              Start typing a username or topic, then press Enter. The best profiles and tags will appear in the results.
            </p>
          </section>
        </aside>
      </div>
    </section>
  );
};

export default SearchUsers;
