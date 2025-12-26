'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function usePageTracking() {
  const pathname = usePathname();
  
  useEffect(() => {
    // Track page view
    if (typeof window !== 'undefined') {
      // Send to analytics
      console.log('Page view:', pathname);
    }
  }, [pathname]);
}
