'use client';

import { useEffect } from 'react';
import { useRouter } from '@/lib/navigation';
import { navigationEvents, type NavigationEvent } from '@/lib/navigation-events';

/**
 * Navigation Listener Component
 *
 * This component listens for navigation events emitted by non-component code
 * (like api.ts) and handles them with Next.js router for smooth client-side navigation.
 *
 * Should be placed in the root layout to handle app-wide navigation events.
 */
export function NavigationListener() {
  const router = useRouter();

  useEffect(() => {
    const handleNavigationEvent = (event: NavigationEvent) => {
      console.log('[NavigationListener] Navigation event:', event);

      switch (event.type) {
        case 'AUTH_REQUIRED':
        case 'LOGOUT':
        case 'NAVIGATE':
          // Use Next.js router for smooth client-side navigation
          router.push(event.path);
          break;
        default:
          console.warn('[NavigationListener] Unknown navigation event type:', event.type);
      }
    };

    // Subscribe to navigation events
    const unsubscribe = navigationEvents.subscribe(handleNavigationEvent);

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, [router]);

  // This component doesn't render anything
  return null;
}
