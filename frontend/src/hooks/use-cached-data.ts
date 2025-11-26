import useSWR from 'swr';
import { cacheStrategies, fetcher } from '@/lib/swr-config';

// Hook for fetching popular tags (cached for 5 minutes)
export function usePopularTags() {
  const { data, error, isLoading, mutate } = useSWR(
    '/tags',
    fetcher,
    cacheStrategies.semiStatic
  );

  // Handle both data.data (ResourceCollection) and data directly
  const tagsData = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);

  return {
    tags: tagsData.slice(0, 5),
    isLoading,
    isError: error,
    mutate,
  };
}

// Hook for fetching notifications with unread count (real-time updates)
export function useNotifications(limit: number = 5, enabled: boolean = true) {
  const { data: notificationsData, error: notificationsError, isLoading: notificationsLoading, mutate: mutateNotifications } = useSWR(
    enabled ? `/notifications?limit=${limit}` : null,
    fetcher,
    cacheStrategies.dynamic
  );

  const { data: unreadData, error: unreadError, mutate: mutateUnread } = useSWR(
    enabled ? '/notifications/unread-count' : null,
    fetcher,
    cacheStrategies.realtime
  );

  return {
    notifications: notificationsData?.data || [],
    unreadCount: unreadData?.count || 0,
    isLoading: notificationsLoading,
    isError: notificationsError || unreadError,
    mutate: () => {
      mutateNotifications();
      mutateUnread();
    },
  };
}

// Hook for fetching categories (static data cached for 1 hour)
export function useCategories() {
  const { data, error, isLoading } = useSWR(
    '/categories',
    fetcher,
    cacheStrategies.static
  );

  return {
    categories: data?.data || [],
    isLoading,
    isError: error,
  };
}

// Hook for fetching posts with caching
export function usePosts(params: Record<string, string | number | boolean> = {}) {
  const queryParams = Object.entries(params).reduce((acc, [key, value]) => {
    acc[key] = String(value);
    return acc;
  }, {} as Record<string, string>);
  const queryString = new URLSearchParams(queryParams).toString();
  const { data, error, isLoading, mutate } = useSWR(
    `/posts${queryString ? `?${queryString}` : ''}`,
    fetcher,
    cacheStrategies.dynamic
  );

  return {
    posts: data?.data || [],
    meta: data?.meta,
    isLoading,
    isError: error,
    mutate,
  };
}

// Hook for fetching user profile - uses auth store instead of API call
export function useUserProfile() {
  // Note: Import useAuthStore dynamically in the component that uses this hook
  // to avoid potential circular dependencies
  return {
    user: null,
    isLoading: false,
    isError: false,
    mutate: () => {},
  };
}

// DEPRECATED: Use useAuthStore directly instead of this hook
// Example: const { user, isAuthenticated } = useAuthStore();

// Hook for fetching leaderboard (cached for 2 minutes)
export function useLeaderboard(timeRange: string, categoryId?: string, limit: number = 10) {
  const params = new URLSearchParams({
    limit: limit.toString(),
    time_range: timeRange,
  });

  if (categoryId) {
    params.append('category_id', categoryId);
  }

  const { data, error, isLoading, mutate } = useSWR(
    `/leaderboard?${params.toString()}`,
    fetcher,
    cacheStrategies.dynamic
  );

  return {
    leaders: data?.data || [],
    currentUserRank: data?.current_user || null,
    isLoading,
    isError: error,
    mutate,
  };
}
