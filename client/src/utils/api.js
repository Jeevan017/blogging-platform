import axios from 'axios';
import { STORAGE_KEYS } from './constants.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

let onUnauthorized = null;

export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const isPublicAuthRequest = (config) => {
  const url = config?.url || '';
  return url.includes('/auth/login') || url.includes('/auth/register');
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isAuthFailure = status === 401 || status === 403;

    if (isAuthFailure && onUnauthorized && !isPublicAuthRequest(error.config)) {
      onUnauthorized();
    }

    return Promise.reject(error);
  }
);

export default api;
