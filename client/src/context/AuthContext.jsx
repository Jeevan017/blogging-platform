import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService.js';
import { setUnauthorizedHandler } from '../utils/api.js';
import { STORAGE_KEYS } from '../utils/constants.js';

export const AuthContext = createContext(null);

const readStoredAuth = () => {
  try {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const userJson = localStorage.getItem(STORAGE_KEYS.USER);
    const user = userJson ? JSON.parse(userJson) : null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
};

const persistAuth = (token, user) => {
  if (token) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  } else {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  }

  if (user) {
    const { token: _token, ...userWithoutToken } = user;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userWithoutToken));
  } else {
    localStorage.removeItem(STORAGE_KEYS.USER);
  }
};

const applyAuthResponse = (data) => {
  const { token, ...userFields } = data;
  return { token, user: { ...userFields, _id: data._id } };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
    persistAuth(null, null);
  }, []);

  const setAuthSession = useCallback((data) => {
    const { token: newToken, user: newUser } = applyAuthResponse(data);
    setToken(newToken);
    setUser(newUser);
    persistAuth(newToken, { ...newUser, token: newToken });
    return newUser;
  }, []);

  const login = useCallback(
    async (credentials) => {
      const data = await authService.login(credentials);
      return setAuthSession(data);
    },
    [setAuthSession]
  );

  const register = useCallback(
    async (userData) => {
      const data = await authService.register(userData);
      return setAuthSession(data);
    },
    [setAuthSession]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Clear local session even if the server call fails
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  const refreshUser = useCallback(async () => {
    const freshUser = await authService.getMe();
    const currentToken = token || localStorage.getItem(STORAGE_KEYS.TOKEN);
    setUser(freshUser);
    if (currentToken) {
      persistAuth(currentToken, { ...freshUser, token: currentToken });
    }
    return freshUser;
  }, [token]);

  const isAuthenticated = Boolean(token && user);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearAuth();
    });
  }, [clearAuth]);

  useEffect(() => {
    const { token: storedToken, user: storedUser } = readStoredAuth();

    if (!storedToken) {
      setLoading(false);
      return;
    }

    setToken(storedToken);
    setUser(storedUser);

    authService
      .getMe()
      .then((freshUser) => {
        setUser(freshUser);
        persistAuth(storedToken, { ...freshUser, token: storedToken });
      })
      .catch(() => {
        clearAuth();
      })
      .finally(() => {
        setLoading(false);
      });
  }, [clearAuth]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      refreshUser,
      isAuthenticated,
    }),
    [user, token, loading, login, register, logout, refreshUser, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
