
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import MainNavigation from '@/components/navigation/main-navigation';
import { StreamingPage } from '@/components/media/streaming-page';

export const metadata = {
  title: 'Pickleball Streaming Platforms | Mindful Champion',
  description: 'Find where to watch live pickleball tournaments and matches. Compare streaming platforms, pricing, and features.',
}

export default async function MediaStreamingPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/media/streaming');
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
    redirect('/auth/signin?callbackUrl=/media/streaming');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-champion-blue/5 via-white to-champion-green/5">
      <MainNavigation user={user} />
      <StreamingPage />
    </div>
  );
}
