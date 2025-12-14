'use client';

import { usePageTracking } from '@/app/lib/tracking';

export function PageTracker() {
  usePageTracking();
  return null; // This component doesn't render anything
}
