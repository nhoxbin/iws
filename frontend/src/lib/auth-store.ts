import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getUserFromToken, isTokenExpired } from './jwt';

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  setAuth: (token: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
  checkAuth: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      _hasHydrated: false,

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

        set({ user, token, isAuthenticated: true });
      },

      updateUser: (updatedUser: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updatedUser } });
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
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
        } else {
          get().logout();
        }
      },

      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        state?.checkAuth();
      },
    }
  )
);
