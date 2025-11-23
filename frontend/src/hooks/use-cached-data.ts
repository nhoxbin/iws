import useSWR from 'swr';
import { cacheStrategies } from '@/lib/swr-config';

// Hook for fetching popular tags (cached for 5 minutes)
export function usePopularTags() {
  const { data, error, isLoading, mutate } = useSWR(
    '/tags',
    null,
    cacheStrategies.semiStatic
  );

  return {
    tags: data?.data?.slice(0, 5) || [],
    isLoading,
    isError: error,
    mutate,
  };
}

// Hook for fetching notifications with unread count (real-time updates)
export function useNotifications(limit: number = 5) {
  const { data: notificationsData, error: notificationsError, isLoading: notificationsLoading, mutate: mutateNotifications } = useSWR(
    `/notifications?limit=${limit}`,
    null,
    cacheStrategies.dynamic
  );

  const { data: unreadData, error: unreadError, mutate: mutateUnread } = useSWR(
    '/notifications/unread-count',
    null,
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
    null,
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
    null,
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

// Hook for fetching user profile (cached for 5 minutes)
export function useUserProfile() {
  const { data, error, isLoading, mutate } = useSWR(
    '/auth/me',
    null,
    cacheStrategies.semiStatic
  );

  return {
    user: data,
    isLoading,
    isError: error,
    mutate,
  };
}
