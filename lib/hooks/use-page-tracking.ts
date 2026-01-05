/**
 * Page Tracking Hook
 * Tracks user navigation paths and page views
 */

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

// Get or create session ID
function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
}

// Track page view
async function trackPageView(data: {
  userId?: string;
  sessionId: string;
  path: string;
  title?: string;
  referrer?: string;
}) {
  try {
    await fetch('/api/tracking/page-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (error) {
    // Silently fail - don't block user experience
    console.debug('Page tracking error:', error);
  }
}

// Update page view duration on leave
async function updatePageDuration(pageViewId: string, duration: number) {
  try {
    await fetch('/api/tracking/page-view', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageViewId, duration }),
    });
  } catch (error) {
    console.debug('Duration tracking error:', error);
  }
}

export function usePageTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  
  const startTimeRef = useRef<number>(Date.now());
  const pageViewIdRef = useRef<string | null>(null);
  const previousPathRef = useRef<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const sessionId = getSessionId();
    const fullPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    const title = document.title;
    const referrer = previousPathRef.current || document.referrer;

    // Track new page view
    startTimeRef.current = Date.now();
    
    trackPageView({
      userId: session?.user?.id,
      sessionId,
      path: fullPath,
      title,
      referrer,
    }).then(() => {
      // Store for cleanup
      pageViewIdRef.current = `${sessionId}_${Date.now()}`;
    });

    // Update previous path for next navigation
    previousPathRef.current = fullPath;

    // Cleanup function - track duration when leaving page
    return () => {
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      if (pageViewIdRef.current && duration > 0) {
        updatePageDuration(pageViewIdRef.current, duration);
      }
    };
  }, [pathname, searchParams, session?.user?.id]);

  // Track page visibility changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleVisibilityChange = () => {
      if (document.hidden && pageViewIdRef.current) {
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        if (duration > 0) {
          updatePageDuration(pageViewIdRef.current, duration);
        }
      } else if (!document.hidden) {
        // Reset start time when user returns to page
        startTimeRef.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Track unload
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeUnload = () => {
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      if (pageViewIdRef.current && duration > 0) {
        // Use sendBeacon for reliable tracking on page unload
        const data = JSON.stringify({ pageViewId: pageViewIdRef.current, duration });
        navigator.sendBeacon?.('/api/tracking/page-view', data);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
}
// Redeploy trigger: Mon Jan  5 18:49:46 UTC 2026
