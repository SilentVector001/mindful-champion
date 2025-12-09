
import { EnhancedMediaCenter } from '@/components/media-center/enhanced-media-center';
import { MediaCenterErrorBoundary } from '@/components/media-center/error-boundary';

// Make this page dynamic to avoid pre-rendering during build
export const dynamic = 'force-dynamic';

export default async function MediaCenterPage() {
  // This page is publicly accessible - no authentication required
  return (
    <MediaCenterErrorBoundary>
      <EnhancedMediaCenter />
    </MediaCenterErrorBoundary>
  );
}
