
'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from './SessionManager';

export function usePageTracking() {
  const pathname = usePathname();
  const { sessionId, isReady } = useSession();
  const pageViewIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!isReady) return;

    // Track page view when pathname changes
    const trackPageView = async () => {
      const title = document.title;
      const referrer = document.referrer;
      
      try {
        const response = await fetch('/api/tracking/page-view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sessionId || null,
            path: pathname,
            title,
            referrer,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.pageViewId) {
            pageViewIdRef.current = data.pageViewId;
          }
        }
      } catch (error) {
        // Silently fail - tracking errors shouldn't affect user experience
        console.debug('Page view tracking skipped:', error);
      }

      // Reset start time
      startTimeRef.current = Date.now();
    };

    trackPageView();

    // Update page view duration when user leaves
    return () => {
      if (pageViewIdRef.current) {
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        
        try {
          // Use sendBeacon for reliable tracking on page unload
          const blob = new Blob(
            [JSON.stringify({
              pageViewId: pageViewIdRef.current,
              duration,
              leftAt: new Date().toISOString(),
            })],
            { type: 'application/json' }
          );
          navigator.sendBeacon('/api/tracking/page-view', blob);
        } catch (error) {
          // Silently fail - tracking errors shouldn't affect user experience
          console.debug('Page duration tracking skipped:', error);
        }
      }
    };
  }, [pathname, sessionId, isReady]);
}
