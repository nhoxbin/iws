import { SWRConfiguration } from 'swr';
import api from './api';

// SWR fetcher function
export const fetcher = async (url: string) => {
  // console.log('SWR Fetcher called with URL:', url);
  const response = await api.get(url);
  // console.log('SWR Fetcher response for', url, ':', response.data);
  return response.data;
};

// Global SWR configuration
export const swrConfig: SWRConfiguration = {
  fetcher,
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 2000, // Dedupe requests within 2 seconds
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  // Cache for 5 minutes by default
  focusThrottleInterval: 300000,
};

// Cache configuration for different data types
export const cacheStrategies = {
  // Static data that rarely changes (e.g., tags, categories)
  static: {
    revalidateOnMount: true,
    revalidateIfStale: false,
    dedupingInterval: 3600000, // 1 hour
  },

  // Semi-static data (e.g., popular tags, top contributors)
  semiStatic: {
    revalidateOnMount: true,
    revalidateIfStale: true,
    dedupingInterval: 300000, // 5 minutes
  },

  // Dynamic data (e.g., notifications, user-specific data)
  dynamic: {
    revalidateOnMount: true,
    revalidateIfStale: true,
    dedupingInterval: 30000, // 30 seconds
  },

  // Real-time data (e.g., unread counts)
  realtime: {
    revalidateOnMount: true,
    revalidateIfStale: true,
    dedupingInterval: 10000, // 10 seconds
    refreshInterval: 30000, // Auto refresh every 30 seconds
  },
};
