import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { MediaHubV2 } from '@/components/media/media-hub-v2';

export const metadata = {
  title: 'Media Hub | Mindful Champion',
  description: 'Your ultimate pickleball content destination - live streams, tournaments, training videos, and more',
}

export default async function MediaCenterPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin?callbackUrl=/media-center');
  }

  return <MediaHubV2 />;
}
