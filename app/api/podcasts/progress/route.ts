
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// POST: Update podcast listening progress
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { episodeId, lastPosition, completed, isFavorite } = body;

    if (!episodeId) {
      return NextResponse.json(
        { error: 'Episode ID is required' },
        { status: 400 }
      );
    }

    const progress = await prisma.userPodcastProgress.upsert({
      where: {
        userId_episodeId: {
          userId: user.id,
          episodeId,
        },
      },
      create: {
        userId: user.id,
        episodeId,
        lastPosition: lastPosition || 0,
        completed: completed || false,
        isFavorite: isFavorite || false,
        listenedAt: completed ? new Date() : null,
      },
      update: {
        lastPosition: lastPosition || 0,
        completed: completed || false,
        isFavorite: isFavorite !== undefined ? isFavorite : undefined,
        listenedAt: completed ? new Date() : undefined,
      },
    });

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Error updating podcast progress:', error);
    return NextResponse.json(
      { error: 'Failed to update podcast progress' },
      { status: 500 }
    );
  }
}
