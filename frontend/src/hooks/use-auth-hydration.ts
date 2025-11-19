'use client';

import { useAuthStore } from '@/lib/auth-store';

export function useAuthHydration() {
  const store = useAuthStore();

  return {
    isHydrated: store._hasHydrated,
    ...store,
  };
}
