
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import MainNavigation from '@/components/navigation/main-navigation';
import { PodcastsPage } from '@/components/media/podcasts-page';

export const metadata = {
  title: 'Pickleball Podcasts | Mindful Champion',
  description: 'Discover the best pickleball podcasts featuring top players, strategies, equipment reviews, and community discussions.',
}

export default async function MediaPodcastsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/media/podcasts');
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
    redirect('/auth/signin?callbackUrl=/media/podcasts');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-champion-green/5 via-white to-champion-blue/5">
      <MainNavigation user={user} />
      <PodcastsPage />
    </div>
  );
}
