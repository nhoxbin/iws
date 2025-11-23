/**
 * Navigation event system for handling redirects from non-component code
 * This allows api.ts and other utilities to trigger client-side navigation
 * without causing full page reloads
 */

export type NavigationEventType = 'AUTH_REQUIRED' | 'LOGOUT' | 'NAVIGATE';

export interface NavigationEvent {
  type: NavigationEventType;
  path: string;
}

class NavigationEventEmitter {
  private listeners: ((event: NavigationEvent) => void)[] = [];

  /**
   * Subscribe to navigation events
   * @param callback Function to call when navigation event is emitted
   * @returns Unsubscribe function
   */
  subscribe(callback: (event: NavigationEvent) => void): () => void {
    this.listeners.push(callback);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  /**
   * Emit a navigation event
   * @param event Navigation event to emit
   */
  emit(event: NavigationEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in navigation event listener:', error);
      }
    });
  }

  /**
   * Convenience method to navigate to a path
   */
  navigate(path: string): void {
    this.emit({ type: 'NAVIGATE', path });
  }

  /**
   * Convenience method to trigger auth required redirect
   */
  requireAuth(): void {
    this.emit({ type: 'AUTH_REQUIRED', path: '/login' });
  }

  /**
   * Convenience method to trigger logout redirect
   */
  logout(): void {
    this.emit({ type: 'LOGOUT', path: '/login' });
  }
}

// Export singleton instance
export const navigationEvents = new NavigationEventEmitter();
