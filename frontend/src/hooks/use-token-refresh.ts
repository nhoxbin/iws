import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/auth-store';

/**
 * Hook to automatically refresh JWT token before it expires
 * Checks every minute if token needs refresh (expires within 5 minutes)
 */
export function useTokenRefresh() {
  const { isAuthenticated, shouldRefreshToken, refreshToken } = useAuthStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      // Clear interval if user is not authenticated
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Check immediately on mount
    if (shouldRefreshToken()) {
      refreshToken();
    }

    // Set up interval to check token expiration every minute
    intervalRef.current = setInterval(() => {
      if (shouldRefreshToken()) {
        console.log('Token expiring soon, refreshing...');
        refreshToken();
      }
    }, 60 * 1000); // Check every minute

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAuthenticated, shouldRefreshToken, refreshToken]);
}
