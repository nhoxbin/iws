import axios from 'axios';
import { isTokenExpired } from './jwt';

const API_BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://127.0.0.1:8000/api'
  : 'https://iws.hpvt.net/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    // Get token from zustand persisted storage
    const authStorage = localStorage.getItem('auth-storage');
    let token = null;

    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        token = parsed.state?.token;
      } catch (e) {
        console.error('Failed to parse auth storage:', e);
      }
    }

    if (token) {
      // Check if token is expired before making the request
      if (isTokenExpired(token)) {
        // Token is expired, clear auth storage
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
        return Promise.reject(new Error('Token expired'));
      }

      // Add Bearer token to Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 (Unauthorized) and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { token } = refreshResponse.data;

        // Update token in auth-storage
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          try {
            const parsed = JSON.parse(authStorage);
            parsed.state.token = token;
            localStorage.setItem('auth-storage', JSON.stringify(parsed));
          } catch (e) {
            console.error('Failed to update auth storage:', e);
          }
        }

        // Update the Authorization header
        originalRequest.headers.Authorization = `Bearer ${token}`;

        // Retry the original request with new token
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear auth and redirect to login
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // For other errors, just reject
    return Promise.reject(error);
  }
);

export default api;
