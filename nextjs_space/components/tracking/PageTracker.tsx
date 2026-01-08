// @ts-nocheck
'use client';

import { usePageTracking } from '@/lib/hooks/use-page-tracking';

export function PageTracker() {
  usePageTracking();
  return null; // This component doesn't render anything - tracks page views automatically
}
