
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import MainNavigation from '@/components/navigation/main-navigation';
import { UnifiedMediaHub } from '@/components/media/unified-media-hub';

export const metadata = {
  title: 'Media Hub | Mindful Champion',
  description: 'Your ultimate pickleball content destination - live tournaments, streaming platforms, podcasts, and events all in one place',
}

export default async function MediaPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/media');
  }

  // Fetch user data for MainNavigation
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      firstName: true,
      lastName: true,
      email: true,
      image: true,
      skillLevel: true,
      rewardPoints: true,
    }
  });

  if (!user) {
    redirect('/auth/signin?callbackUrl=/media');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <MainNavigation user={user} />
      <UnifiedMediaHub />
    </div>
  );
}
