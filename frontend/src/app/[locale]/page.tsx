'use client';

import { useEffect } from 'react';
import { useRouter } from '@/lib/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return null;
}
