import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState.jsx';
import PageMeta from '../components/seo/PageMeta.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import Pagination from '../components/common/Pagination.jsx';
import PostCardSkeleton from '../components/common/PostCardSkeleton.jsx';
import SearchBar from '../components/common/SearchBar.jsx';
import PostCard from '../components/post/PostCard.jsx';
import useAuth from '../hooks/useAuth.js';
import * as postService from '../services/postService.js';
import { PAGINATION, ROUTES } from '../utils/constants.js';
import getErrorMessage from '../utils/getErrorMessage.js';

const SKELETON_COUNT = 6;

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(PAGINATION.DEFAULT_PAGE);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const search = searchParams.get('search') || '';

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await postService.getPosts({
        page,
        limit: PAGINATION.DEFAULT_LIMIT,
        search: search || undefined,
      });

      setPosts(data.posts);
      setTotalPages(data.totalPages);
    } catch (err) {
      setPosts([]);
      setError(getErrorMessage(err, 'Failed to load posts.'));
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSearch = useCallback((term) => {
    if (term) {
      setSearchParams({ search: term });
    } else {
      setSearchParams({});
    }
    setPage(PAGINATION.DEFAULT_PAGE);
  }, [setSearchParams]);

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const trendingTags = useMemo(() => {
    const tagCounts = posts.reduce((acc, post) => {
      (post.tags || []).forEach((tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {});

    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([tag]) => tag);
  }, [posts]);

  const suggestedAuthors = useMemo(() => {
    const authors = new Map();
    posts.forEach((post) => {
      const author = post.author?.username || 'Unknown';
      if (!authors.has(author)) {
        authors.set(author, { username: author, image: post.author?.profilePicture });
      }
    });
    return Array.from(authors.values()).slice(0, 4);
  }, [posts]);

  const popularPosts = useMemo(() => {
    return [...posts]
      .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
      .slice(0, 3);
  }, [posts]);

  return (
    <section className="home-page">
      <PageMeta
        title="Discover Stories"
        description="Explore ideas from developers and writers. Read, write, and connect on BlogSpace."
      />

      <section className="home-hero">
        <div className="home-hero__content">
          <div>
            <p className="eyebrow">Community feed</p>
            <h1>Discover Stories from Builders</h1>
            <p className="home-hero__subtitle">
              Read the latest posts, follow inspiring authors, and find trends shaping the developer community.
            </p>
          </div>
          <div className="home-hero__actions">
            <Link to={isAuthenticated ? ROUTES.CREATE : ROUTES.REGISTER} className="btn btn--primary">
              {isAuthenticated ? 'Write a story' : 'Join BlogSpace'}
            </Link>
            <Link to={ROUTES.USERS} className="btn btn--secondary">
              Discover creators
            </Link>
          </div>
        </div>

        <div className="home-hero__stats">
          <div className="stats-card">
            <span className="stats-card__value">{posts.length}</span>
            <span className="stats-card__label">Posts on this page</span>
          </div>
          <div className="stats-card">
            <span className="stats-card__value">{suggestedAuthors.length}</span>
            <span className="stats-card__label">Active authors</span>
          </div>
          <div className="stats-card">
            <span className="stats-card__value">{trendingTags.length}</span>
            <span className="stats-card__label">Trending tags</span>
          </div>
        </div>
      </section>

      <div className="home-dashboard">
        <main className="home-feed">
          <div className="search-section">
            <SearchBar onSearch={handleSearch} />
          </div>

          <ErrorMessage message={error} />

          {loading ? (
            <div className="post-grid" aria-busy="true" aria-label="Loading posts">
              {Array.from({ length: SKELETON_COUNT }, (_, i) => (
                <PostCardSkeleton key={i} />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <EmptyState
              icon={search ? '🔍' : '✍️'}
              title={search ? 'No results found' : 'No posts yet'}
              description={
                search
                  ? `We couldn't find any posts matching "${search}". Try a different search term.`
                  : 'You are all caught up. Publish your first story to start building your audience.'
              }
              action={
                !search && (
                  <Link
                    to={isAuthenticated ? ROUTES.CREATE : ROUTES.REGISTER}
                    className="btn btn--primary"
                  >
                    {isAuthenticated ? 'Write your first post' : 'Join and start writing'}
                  </Link>
                )
              }
            />
          ) : (
            <>
              <div className="post-grid">
                {posts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>

              <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
            </>
          )}
        </main>

        <aside className="home-sidebar">
          <div className="sidebar-card">
            <h2>Trending Tags</h2>
            <div className="tag-list">
              {trendingTags.length > 0 ? (
                trendingTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="tag-pill"
                    onClick={() => handleSearch(tag)}
                  >
                    #{tag}
                  </button>
                ))
              ) : (
                <p className="text-muted">Explore tags and find the topics people are writing about.</p>
              )}
            </div>
          </div>

          <div className="sidebar-card">
            <h2>Suggested Authors</h2>
            <div className="author-grid">
              {suggestedAuthors.length > 0 ? (
                suggestedAuthors.map((author) => (
                  <div key={author.username} className="discover-author-card">
                    <img
                      className="discover-author-avatar"
                      src={author.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(author.username)}&background=EFF6FF&color=1f6ddf&size=128`}
                      alt={author.username}
                      width={56}
                      height={56}
                    />
                    <div>
                      <p className="discover-author-name">{author.username}</p>
                      <p className="discover-author-meta">Recent contributor</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted">Suggested authors will appear once posts are available.</p>
              )}
            </div>
          </div>

          <div className="sidebar-card">
            <h2>Popular Stories</h2>
            <div className="popular-grid">
              {popularPosts.length > 0 ? (
                popularPosts.map((post) => (
                  <Link key={post._id} to={ROUTES.POST(post._id)} className="user-card" aria-label={`View popular post ${post.title}`}>
                    <p className="user-card__username">{post.title}</p>
                    <p className="user-card__bio">{post.author?.username || 'Unknown author'}</p>
                  </Link>
                ))
              ) : (
                <p className="text-muted">Popular stories will surface here once readers engage with posts.</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default Home;
