import api from '../utils/api.js';
import { API_ENDPOINTS } from '../utils/constants.js';

export const register = async (userData) => {
  const { data } = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
  return data;
};

export const login = async (credentials) => {
  const { data } = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
  return data;
};

export const logout = async () => {
  const { data } = await api.post(API_ENDPOINTS.AUTH.LOGOUT);
  return data;
};

export const getMe = async () => {
  const { data } = await api.get(API_ENDPOINTS.AUTH.ME);
  return data;
};
