import api from '../utils/api.js';
import { API_ENDPOINTS } from '../utils/constants.js';

export const globalSearch = async (query) => {
  const { data } = await api.get(API_ENDPOINTS.SEARCH.GLOBAL(query));
  return data;
};