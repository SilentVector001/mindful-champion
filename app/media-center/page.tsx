
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { EnhancedMediaCenter } from '@/components/media-center/enhanced-media-center';
import { MediaCenterErrorBoundary } from '@/components/media-center/error-boundary';

export default async function MediaCenterPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin?callbackUrl=/media-center');
  }

  return (
    <MediaCenterErrorBoundary>
      <EnhancedMediaCenter />
    </MediaCenterErrorBoundary>
  );
}
