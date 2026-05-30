import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import * as searchService from '../../services/searchService.js';
import { ROUTES } from '../../utils/constants.js';
import getErrorMessage from '../../utils/getErrorMessage.js';

const RECENTS_KEY = 'blogspace_search_recents';

const readRecents = () => {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) => typeof x === 'string').slice(0, 8);
  } catch {
    return [];
  }
};

const writeRecents = (query) => {
  if (!query?.trim()) return;
  try {
    const current = readRecents();
    const next = [query.trim(), ...current.filter((q) => q !== query.trim())].slice(0, 8);
    localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
};

const GlobalSearch = ({ open, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ users: [], posts: [], tags: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  const fetchResults = useCallback(async (searchQuery) => {
    const q = searchQuery?.trim();
    if (!q) {
      setResults({ users: [], posts: [], tags: [] });
      setError('');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await searchService.globalSearch(q);
      setResults(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Search failed.'));
      setResults({ users: [], posts: [], tags: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults({ users: [], posts: [], tags: [] });
      setSelectedIndex(-1);
      setError('');
      setLoading(false);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (query.trim().length >= 2) {
        fetchResults(query);
      } else {
        setResults({ users: [], posts: [], tags: [] });
        setError('');
      }
    }, 250);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, fetchResults, open]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onClose, query]);

  const handleItemClick = (type, payload) => {
    // Persist recents using the current query (not the clicked result label)
    writeRecents(query);
    onClose();

    if (type === 'user') {
      if (payload && typeof payload === 'object' && payload._id) {
        navigate(ROUTES.PROFILE(payload._id));
        return;
      }
      navigate(ROUTES.USERS);
      return;
    }

    if (type === 'post') {
      navigate(`/post/${payload?._id}`);
      return;
    }

    if (type === 'tag') {
      const tagName = typeof payload === 'string' ? payload : payload?.tag;
      if (!tagName) return;
      navigate(`/users?search=${encodeURIComponent(tagName)}`);
    }
  };

  const searchItems = useMemo(() => {
    if (!query.trim()) return [];

    return [
      ...results.users.map((user) => ({
        key: `user-${user._id}`,
        label: user.username,
        subtitle: user.bio || 'User profile',
        type: 'user',
        payload: user,
      })),
      ...results.posts.map((post) => ({
        key: `post-${post._id}`,
        label: post.title,
        subtitle: post.tags?.join(', ') || 'Post',
        type: 'post',
        payload: post,
      })),
      ...results.tags.map((tagDoc) => {
        const tagName = tagDoc?.tags?.[0];
        if (!tagName) return null;
        return {
          key: `tag-${tagDoc._id}`,
          label: `#${tagName}`,
          subtitle: 'Tag',
          type: 'tag',
          payload: tagName,
        };
      }).filter(Boolean),
    ];
  }, [query, results.users, results.posts, results.tags]);

  const activeItems = searchItems.length;
  const showDropdown = open;

  const recents = useMemo(() => readRecents(), [open]);

  const handleKeyDown = (event) => {
    if (!open) return;

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        onClose();
        break;
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, activeItems - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0 && searchItems[selectedIndex]) {
          handleItemClick(searchItems[selectedIndex].type, searchItems[selectedIndex].payload);
        }
        break;
      default:
        break;
    }
  };

  const getAvatarUrl = (profilePicture, username) => {
    if (profilePicture) return profilePicture;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(username || 'U')}&background=2563eb&color=fff&size=32`;
  };

  if (!open) {
    return null;
  }

  const content = (
    <div className="global-search global-search--overlay">
      <div className="global-search__panel" role="dialog" aria-modal="true" aria-label="Search">
        <div className="global-search__header">
          <div className="global-search__input-wrapper">
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search BlogSpace..."
                aria-label="Search BlogSpace"
                autoComplete="off"
              />
            <button
              type="button"
              className="global-search__close"
              onClick={onClose}
              aria-label="Close search"
            >
              ×
            </button>
          </div>
          <div className="global-search__hint">Search across users, posts, and tags.</div>
        </div>

        <div ref={dropdownRef} className="global-search__results" role="listbox">
          {error ? (
            <div className="global-search__message global-search__message--error global-search__message--empty">{error}</div>
          ) : loading ? (
            <div className="global-search__message global-search__message--empty">Searching...</div>
          ) : !query.trim() ? (
            <div className="global-search__message global-search__message--empty">
              {recents.length > 0 ? (
                <>
                  <div className="global-search__empty-title">Recent searches</div>
                  <div className="global-search__recents">
                    {recents.map((q) => (
                      <button
                        key={q}
                        type="button"
                        className="btn btn--ghost btn--sm"
                        onClick={() => {
                          setQuery(q);
                          setSelectedIndex(-1);
                        }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="global-search__empty-icon">🔍</div>
                  <div className="global-search__empty-title">Start searching</div>
                  <div className="global-search__empty-description">Search users, posts, and tags.</div>
                </>
              )}
            </div>
          ) : searchItems.length === 0 ? (
            <div className="global-search__message global-search__message--empty">
              <div className="global-search__empty-title">No matches found</div>
              <div className="global-search__empty-description">Try a different keyword.</div>
            </div>
          ) : (
            <ul className="global-search__list">
              {searchItems.map((item, index) => {
                const categoryLabel = item.type === 'user' ? 'User' : item.type === 'post' ? 'Post' : 'Tag';
                const icon = item.type === 'user' ? '👤' : item.type === 'post' ? '📝' : '🏷️';

                return (
                  <li key={item.key}>
                    <button
                      type="button"
                      className={`global-search__item${index === selectedIndex ? ' is-active' : ''}`}
                      onClick={() => handleItemClick(item.type, item.payload)}
                      role="option"
                      aria-selected={index === selectedIndex}
                    >
                      <div>
                        <span className="global-search__item-title">{item.label}</span>
                        <span className="global-search__item-subtitle">{icon} {categoryLabel}</span>
                      </div>
                      {item.type === 'user' && item.payload && (
                        <img
                          className="global-search__avatar"
                          src={getAvatarUrl(item.payload.profilePicture, item.payload.username)}
                          alt=""
                          width={32}
                          height={32}
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' && document.body
    ? createPortal(content, document.body)
    : null;
};

export default GlobalSearch;
