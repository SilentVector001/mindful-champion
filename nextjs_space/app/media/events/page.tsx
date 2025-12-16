
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import MainNavigation from '@/components/navigation/main-navigation';
import { EventsPage } from '@/components/media/events-page';

export const metadata = {
  title: 'Pickleball Events & Tournaments | Mindful Champion',
  description: 'Stay updated with major pickleball tournaments, championships, and events. Get schedules, results, and live coverage information.',
}

export default async function MediaEventsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/media/events');
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
    redirect('/auth/signin?callbackUrl=/media/events');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-champion-gold/5 via-white to-champion-blue/5">
      <MainNavigation user={user} />
      <EventsPage />
    </div>
  );
}
