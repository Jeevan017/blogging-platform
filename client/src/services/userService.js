import api from '../utils/api.js';
import { API_ENDPOINTS } from '../utils/constants.js';

export const getProfile = async (id) => {
  const { data } = await api.get(API_ENDPOINTS.USERS.BY_ID(id));
  return data;
};

export const updateProfile = async (id, formData) => {
  const { data } = await api.put(API_ENDPOINTS.USERS.BY_ID(id), formData);
  return data;
};

export const toggleFollow = async (id) => {
  const { data } = await api.put(API_ENDPOINTS.USERS.FOLLOW(id));
  return data;
};

export const getFollowers = async (id) => {
  const { data } = await api.get(API_ENDPOINTS.USERS.FOLLOWERS(id));
  return data;
};

export const getFollowing = async (id) => {
  const { data } = await api.get(API_ENDPOINTS.USERS.FOLLOWING(id));
  return data;
};

export const searchUsers = async (query) => {
  const { data } = await api.get(API_ENDPOINTS.USERS.SEARCH(query));
  return data;
};

export const changePassword = async (passwords) => {
  const { data } = await api.put(API_ENDPOINTS.USERS.CHANGE_PASSWORD, passwords);
  return data;
};
