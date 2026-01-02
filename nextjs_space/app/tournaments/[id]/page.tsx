// @ts-nocheck
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TournamentDetailClient } from './tournament-detail-client';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function TournamentDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const tournament = await prisma.tournament.findUnique({
    where: { id: params?.id ?? '' },
    include: {
      registrations: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      },
      _count: {
        select: { registrations: true }
      }
    }
  });

  if (!tournament) {
    notFound();
  }

  // Check if user is already registered
  const userRegistration = tournament?.registrations?.find(
    (reg) => reg?.userId === session?.user?.id
  );

  return (
    <TournamentDetailClient 
      tournament={tournament} 
      userId={session?.user?.id ?? ''}
      isRegistered={!!userRegistration}
      registrationStatus={userRegistration?.status}
    />
  );
}
