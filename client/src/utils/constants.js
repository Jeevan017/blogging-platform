export const STORAGE_KEYS = {
  TOKEN: 'blog_token',
  USER: 'blog_user',
};

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  POSTS: {
    BASE: '/posts',
    BY_ID: (id) => `/posts/${id}`,
    BY_USER: (userId) => `/posts/user/${userId}`,
    LIKE: (id) => `/posts/${id}/like`,
  },
  USERS: {
    BY_ID: (id) => `/users/${id}`,
    FOLLOW: (id) => `/users/${id}/follow`,
    FOLLOWERS: (id) => `/users/${id}/followers`,
    FOLLOWING: (id) => `/users/${id}/following`,
    SEARCH: (q) => `/users/search?q=${encodeURIComponent(q)}`,
    CHANGE_PASSWORD: '/users/change-password',
  },
  SEARCH: {
    GLOBAL: (q) => `/search?q=${encodeURIComponent(q)}`,
  },
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  POST: (id) => `/post/${id}`,
  CREATE: '/create',
  EDIT: (id) => `/edit/${id}`,
  PROFILE: (id) => `/profile/${id}`,
  PROFILE_EDIT: '/profile/edit',
  CHANGE_PASSWORD: '/change-password',
  USERS: '/users',
  DISCOVER: '/discover',
};
