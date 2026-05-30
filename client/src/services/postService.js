import api from '../utils/api.js';
import { API_ENDPOINTS } from '../utils/constants.js';

export const getPosts = async (params = {}) => {
  const { data } = await api.get(API_ENDPOINTS.POSTS.BASE, { params });
  return data;
};

export const getPostById = async (id) => {
  const { data } = await api.get(API_ENDPOINTS.POSTS.BY_ID(id));
  return data;
};

export const getPostsByUser = async (userId, params = {}) => {
  const { data } = await api.get(API_ENDPOINTS.POSTS.BY_USER(userId), { params });
  return data;
};

export const createPost = async (formData) => {
  const { data } = await api.post(API_ENDPOINTS.POSTS.BASE, formData);
  return data;
};

export const updatePost = async (id, formData) => {
  const { data } = await api.put(API_ENDPOINTS.POSTS.BY_ID(id), formData);
  return data;
};

export const deletePost = async (id) => {
  const { data } = await api.delete(API_ENDPOINTS.POSTS.BY_ID(id));
  return data;
};

export const toggleLike = async (id) => {
  const { data } = await api.put(API_ENDPOINTS.POSTS.LIKE(id));
  return data;
};
