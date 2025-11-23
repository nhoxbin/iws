'use client';

import { usePathname } from '@/lib/navigation';
import { useEffect, useRef } from 'react';

/**
 * Top loading bar that appears during page navigation
 * Pure CSS animation triggered by pathname changes
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    // Trigger animation by toggling class
    bar.classList.remove('opacity-0');
    bar.classList.add('opacity-100');

    const timer = setTimeout(() => {
      bar.classList.remove('opacity-100');
      bar.classList.add('opacity-0');
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div
      ref={barRef}
      className="fixed top-0 left-0 h-1 bg-blue-600 z-9999 shadow-lg opacity-0 transition-opacity duration-300"
      style={{ width: '100%', animation: 'progressBar 0.3s ease-out' }}
    />
  );
}
