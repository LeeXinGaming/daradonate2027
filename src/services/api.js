import axios from 'axios';

// Dynamic API Base URL resolution: favors production Render URL and environment variables
export const API_BASE_URL = (() => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // If running on local development without env, default to local port 5005
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
      return `${window.location.protocol}//${hostname}:5005/api`;
    }
  }

  return 'https://daradonato-backend.onrender.com/api';
})();

export const getApiUrl = (path = '') => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (API_BASE_URL.startsWith('http')) {
    return `${API_BASE_URL.replace(/\/+$/, '')}${cleanPath}`;
  }
  return `/api${cleanPath}`;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 25000
});

// Attach Authorization Bearer token from localStorage & clean up double slashes
api.interceptors.request.use((config) => {
  if (config.url && config.url.includes('//') && !config.url.startsWith('http')) {
    config.url = config.url.replace(/\/+/g, '/');
  }
  const token = localStorage.getItem('zoee_auth_token') || localStorage.getItem('dara_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Normalize API error response
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.response?.data?.error || error.message || 'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  }
);

export default api;
