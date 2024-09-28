import axios from 'axios';

const ApiService = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost',
});

ApiService.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default {
  get(url, params = {}) {
    return ApiService.get(url, { params });
  },

  post(url, data) {
    return ApiService.post(url, data);
  },

  put(url, data) {
    return ApiService.put(url, data);
  },

  delete(url) {
    return ApiService.delete(url);
  }
};
