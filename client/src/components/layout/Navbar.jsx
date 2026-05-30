import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import { ROUTES } from '../../utils/constants.js';
import { showSuccess } from '../../utils/toast.js';
import GlobalSearch from '../search/GlobalSearch.jsx';

const getAvatarUrl = (user) => {
  if (user?.profilePicture) return user.profilePicture;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'U')}&background=4A8BDF&color=fff&size=128`;
};

const Navbar = () => {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const dropdownRef = useRef(null);
  const avatarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        avatarRef.current &&
        !avatarRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
        setSearchOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);



  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    showSuccess('Logged out successfully');
    navigate(ROUTES.HOME);
  };

  const navLinkClass = ({ isActive }) =>
    `nav-link${isActive ? ' nav-link--active' : ''}`;

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to={ROUTES.HOME} className="navbar__brand">
          <span className="navbar__brand-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <span className="navbar__brand-text">BlogSpace</span>
        </Link>

        <nav
          className="navbar__nav"
          aria-label="Main navigation"
        >
          <NavLink to={ROUTES.HOME} className={navLinkClass} end>
            <span className="nav-link__icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </span>
            Home
          </NavLink>

          <NavLink to={ROUTES.USERS} className={navLinkClass}>
            <span className="nav-link__icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </span>
            Explore
          </NavLink>

          {!loading && isAuthenticated && (
            <NavLink to={ROUTES.CREATE} className={navLinkClass}>
              <span className="nav-link__icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </span>
              Write
            </NavLink>
          )}
        </nav>

        <div className="navbar__actions">
          {!loading && (
            <>
              <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

              <div className="navbar__search-control">
                <button
                  type="button"
                  className="navbar__search-button"
                  onClick={() => setSearchOpen((open) => !open)}
                  aria-label="Open search"
                  aria-expanded={searchOpen}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="M21 21l-4.35-4.35"/>
                  </svg>
                </button>
              </div>

              {!loading && !isAuthenticated && (
                <div className="navbar__auth">
                  <NavLink to={ROUTES.LOGIN} className="btn btn--ghost btn--sm">
                    Sign In
                  </NavLink>
                  <NavLink to={ROUTES.REGISTER} className="btn btn--primary btn--sm">
                    Get Started
                  </NavLink>
                </div>
              )}

              {isAuthenticated && (
                <div className="navbar__user-menu">
                  <button
                    ref={avatarRef}
                    type="button"
                    className="navbar__avatar-btn"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    aria-expanded={dropdownOpen}
                    aria-label="User menu"
                  >
                    <img
                      className="navbar__avatar"
                      src={getAvatarUrl(user)}
                      alt=""
                      width={36}
                      height={36}
                    />
                  </button>

                  {dropdownOpen && (
                    <div
                      ref={dropdownRef}
                      className="navbar__dropdown"
                      role="menu"
                    >
                      <div className="navbar__dropdown-header">
                        <img
                          className="navbar__dropdown-avatar"
                          src={getAvatarUrl(user)}
                          alt=""
                          width={48}
                          height={48}
                        />
                        <div className="navbar__dropdown-info">
                          <span className="navbar__dropdown-name">{user?.username}</span>
                          <span className="navbar__dropdown-email">{user?.email}</span>
                        </div>
                      </div>
                      <div className="navbar__dropdown-divider" />
                      <button
                        type="button"
                        className="navbar__dropdown-item"
                        onClick={() => {
                          setDropdownOpen(false);
                          navigate(ROUTES.PROFILE(user._id));
                        }}
                        role="menuitem"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                        My Profile
                      </button>
                      <button
                        type="button"
                        className="navbar__dropdown-item"
                        onClick={() => {
                          setDropdownOpen(false);
                          navigate(ROUTES.CHANGE_PASSWORD);
                        }}
                        role="menuitem"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        Change Password
                      </button>
                      <div className="navbar__dropdown-divider" />
                      <button
                        type="button"
                        className="navbar__dropdown-item navbar__dropdown-item--danger"
                        onClick={handleLogout}
                        role="menuitem"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                          <polyline points="16 17 21 12 16 7"/>
                          <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;