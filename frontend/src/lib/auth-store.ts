import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getUserFromToken, isTokenExpired, isTokenExpiringSoon } from './jwt';

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  job_description?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  userFetched: boolean; // Track if we've tried to fetch user from API
  setAuth: (token: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
  checkAuth: () => void;
  refreshToken: () => Promise<void>;
  shouldRefreshToken: () => boolean;
  fetchUser: () => Promise<void>; // Fetch full user profile from API
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      userFetched: false,

      setAuth: (token: string) => {
        // Decode JWT token to get user info
        const user = getUserFromToken(token);

        if (!user) {
          console.error('Invalid token');
          return;
        }

        // Check if token is expired
        if (isTokenExpired(token)) {
          console.error('Token is expired');
          get().logout();
          return;
        }

        set({ user, token, isAuthenticated: true, userFetched: false });
        // Fetch full user profile after setting token
        get().fetchUser();
      },

      fetchUser: async () => {
        const { token, isAuthenticated } = get();

        // Don't fetch if not authenticated or no token
        if (!isAuthenticated || !token) {
          set({ userFetched: true });
          return;
        }

        // Don't fetch if token is expired
        if (isTokenExpired(token)) {
          get().logout();
          return;
        }

        try {
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });

          if (response.ok) {
            const userData = await response.json();
            set({ user: userData, userFetched: true });
          } else {
            // If 401, token might be invalid, logout
            if (response.status === 401) {
              get().logout();
            } else {
              set({ userFetched: true });
            }
          }
        } catch (error) {
          console.error('Failed to fetch user:', error);
          set({ userFetched: true });
        }
      },

      updateUser: (updatedUser: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updatedUser } });
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, userFetched: false });
      },

      checkAuth: () => {
        const { token } = get();

        if (!token) {
          get().logout();
          return;
        }

        // Check if token is expired
        if (isTokenExpired(token)) {
          console.log('Token expired, logging out');
          get().logout();
          return;
        }

        // Token is valid, update user info from token
        const user = getUserFromToken(token);
        if (user) {
          set({ user, isAuthenticated: true });
          // Fetch full user profile if not already fetched
          if (!get().userFetched) {
            get().fetchUser();
          }
        } else {
          get().logout();
        }
      },

      shouldRefreshToken: () => {
        const { token } = get();
        if (!token) return false;

        // Refresh if token will expire in the next 5 minutes
        return isTokenExpiringSoon(token, 5);
      },

      refreshToken: async () => {
        const { token } = get();
        if (!token) return;

        try {
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

          const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });

          if (response.ok) {
            const data = await response.json();
            get().setAuth(data.token);
          } else {
            throw new Error('Failed to refresh token');
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
          get().logout();
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.checkAuth();

        // Listen for token refresh events from API interceptor
        if (typeof window !== 'undefined') {
          window.addEventListener('auth-token-refreshed', ((event: CustomEvent) => {
            const { token } = event.detail;
            if (token) {
              state?.setAuth(token);
            }
          }) as EventListener);
        }
      },
    }
  )
);
