'use client';

import { ComponentType, ReactNode, useTransition } from 'react';
import { useRouter as useNextRouter } from 'next/navigation';

/**
 * Higher-order component that wraps navigation to prevent browser loading spinner
 * Uses React transitions to keep the UI responsive during navigation
 */
export function withTransition<P extends object>(Component: ComponentType<P>) {
  return function TransitionWrapper(props: P) {
    const [isPending, startTransition] = useTransition();

    return (
      <>
      { isPending && (
        <div className= "fixed inset-0 bg-black/5 backdrop-blur-sm z-50 pointer-events-none" />
        )
  }
    < Component {...props } />
      </>
    );
};
}

/**
 * Hook that wraps router navigation in transitions
 * This prevents the browser from showing its loading indicator
 */
export function useTransitionRouter() {
  const router = useNextRouter();
  const [isPending, startTransition] = useTransition();

  return {
    push: (href: string) => startTransition(() => router.push(href)),
    replace: (href: string) => startTransition(() => router.replace(href)),
    back: () => startTransition(() => router.back()),
    forward: () => startTransition(() => router.forward()),
    refresh: () => startTransition(() => router.refresh()),
    prefetch: router.prefetch,
    isPending,
  };
}
