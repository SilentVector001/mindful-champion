
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET: Fetch podcast episodes with optional filtering
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const showId = searchParams.get('showId');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};
    if (showId) {
      where.showId = showId;
    }

    const session = await getServerSession(authOptions);
    let userId: string | null = null;

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      userId = user?.id || null;
    }

    const episodes = await prisma.podcastEpisode.findMany({
      where,
      include: {
        show: true,
        userProgress: userId
          ? {
              where: { userId },
            }
          : false,
      },
      orderBy: { publishDate: 'desc' },
      take: limit,
    });

    return NextResponse.json({ episodes });
  } catch (error) {
    console.error('Error fetching podcast episodes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch podcast episodes' },
      { status: 500 }
    );
  }
}
