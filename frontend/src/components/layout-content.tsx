'use client';

import { usePathname } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { useTokenRefresh } from '@/hooks/use-token-refresh';

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Automatically refresh token before expiration
  useTokenRefresh();

  // Check if current page is login or register
  const isAuthPage = pathname?.includes('/login') || pathname?.includes('/register');

  return (
    <div className="min-h-screen bg-background">
      {/* AppHeader stays cached here - outside Suspense, outside page component tree */}
      {!isAuthPage && <AppHeader />}
      <main className={isAuthPage ? '' : 'md:ml-20 mt-14 md:mt-16'}>
        {children}
      </main>
    </div>
  );
}
