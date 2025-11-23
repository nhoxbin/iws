'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from '@/lib/navigation';

/**
 * Debug component to verify SPA navigation
 * This logs to console to help identify if pages are actually reloading
 *
 * If you see "SPA navigation - component stayed mounted!" then it's working correctly.
 * If you only see "Component first mount or full page reload" on every click, it's reloading.
 */
export function SPADebugger() {
  const navigationCount = useRef(0);
  const mountTime = useRef(new Date().toISOString());
  const pathname = usePathname();

  useEffect(() => {
    navigationCount.current += 1;
    console.log('═══════════════════════════════════════');
    console.log('🔄 Navigation detected:', pathname);
    console.log('📊 Navigation count:', navigationCount.current);
    console.log('⏰ Component mounted at:', mountTime.current);
    console.log('🎯 Current time:', new Date().toISOString());

    // If component remounts, this time will be different
    if (navigationCount.current === 1) {
      console.log('🚀 Component first mount or full page reload');
    } else {
      console.log('✅ SPA WORKING - component stayed mounted!');
    }
    console.log('═══════════════════════════════════════');
  }, [pathname]);

  // This component doesn't render anything visible
  return null;
}
