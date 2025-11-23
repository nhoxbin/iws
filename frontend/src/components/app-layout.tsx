'use client';

import { memo } from 'react';
import { AppHeader } from '@/components/app-header';

interface AppLayoutProps {
  children: React.ReactNode;
  showSearch?: boolean;
}

function AppLayoutComponent({ children, showSearch = true }: AppLayoutProps) {
  return (
    <>
      <AppHeader showSearch={showSearch} />
      <main className="md:ml-20 mt-14 md:mt-16">
        {children}
      </main>
    </>
  );
}

export const AppLayout = memo(AppLayoutComponent);
