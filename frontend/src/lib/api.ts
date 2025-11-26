import axios from 'axios';
import { isTokenExpired } from './jwt';
import { navigationEvents } from './navigation-events';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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
    console.log(process.env.NEXT_PUBLIC_API_URL);
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

        // Define truly protected endpoints that always require valid auth
        const protectedEndpoints = ['/notifications', '/saved-posts'];
        const isProtectedEndpoint = protectedEndpoints.some(endpoint =>
          config.url?.includes(endpoint)
        );

        // Only reject for endpoints that absolutely require authentication
        if (isProtectedEndpoint) {
          navigationEvents.requireAuth();
          return Promise.reject(new Error('Token expired'));
        }

        // For public endpoints (including GET to /posts, /categories, /tags),
        // just continue without the expired token - don't redirect
        return config;
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
      console.log('[API] 401 error for:', originalRequest.url, 'Method:', originalRequest.method);
      originalRequest._retry = true;

      // Get token from storage
      const authStorage = localStorage.getItem('auth-storage');
      let oldToken = null;

      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage);
          oldToken = parsed.state?.token;
        } catch (e) {
          console.error('Failed to parse auth storage:', e);
        }
      }

      console.log('[API] Has old token:', !!oldToken);

      // Only try to refresh if user had a token
      if (oldToken) {
        try {
          // Try to refresh the token - must include current token in header
          const refreshResponse = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            {},
            {
              headers: {
                Authorization: `Bearer ${oldToken}`,
              },
              withCredentials: true,
            }
          );

          const { token } = refreshResponse.data;

          // Update token in auth-storage
          if (authStorage) {
            try {
              const parsed = JSON.parse(authStorage);
              parsed.state.token = token;
              localStorage.setItem('auth-storage', JSON.stringify(parsed));

              // Trigger a custom event to notify auth store of token update
              window.dispatchEvent(new CustomEvent('auth-token-refreshed', { detail: { token } }));
            } catch (e) {
              console.error('Failed to update auth storage:', e);
            }
          }

          // Update the Authorization header for retry
          originalRequest.headers.Authorization = `Bearer ${token}`;

          // Retry the original request with new token
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear auth and redirect to login ONLY if accessing protected routes
          console.error('Token refresh failed:', refreshError);
          localStorage.removeItem('auth-storage');

          // Only redirect to login if the endpoint is actually protected
          // Public endpoints like /posts, /categories, /tags should not trigger redirect
          const protectedEndpoints = ['/notifications', '/saved-posts', '/auth/user/role'];
          const isProtectedEndpoint = protectedEndpoints.some(endpoint =>
            originalRequest.url?.includes(endpoint)
          );

          if (isProtectedEndpoint) {
            navigationEvents.requireAuth();
          }
          return Promise.reject(refreshError);
        }
      }
      // If no token and it's a protected endpoint, redirect to login
      // Otherwise, just let the request fail naturally (for public endpoints)
      // Only redirect for truly protected endpoints or mutation operations
      const method = originalRequest.method?.toLowerCase();
      const url = originalRequest.url || '';

      console.log('[API] No token, checking if should redirect for:', url, 'Method:', method);

      // Define which endpoints should trigger login redirect
      // Note: /auth/me should NOT redirect - it's used to check auth status and should fail silently
      const redirectEndpoints = ['/notifications', '/saved-posts'];
      const shouldRedirect = redirectEndpoints.some(endpoint => url.includes(endpoint));

      // Check if it's a mutation to a protected resource (POST/PUT/DELETE to /posts/:id, /answers/:id, etc.)
      const isMutationToResource = !['get', 'head', 'options'].includes(method || 'get') &&
        (url.match(/\/posts\/\d+/) || url.match(/\/answers\/\d+/));

      console.log('[API] shouldRedirect:', shouldRedirect, 'isMutationToResource:', isMutationToResource);

      if (shouldRedirect || isMutationToResource) {
        console.log('[API] Redirecting to login');
        navigationEvents.requireAuth();
      } else {
        console.log('[API] Endpoint can fail without redirect (e.g., /auth/me check)');
      }
    }

    // For other errors, just reject without redirecting
    return Promise.reject(error);
  }
);

export default api;
