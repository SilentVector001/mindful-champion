
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const live = searchParams.get('live') === 'true';

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: 'Event ID is required' },
        { status: 400 }
      );
    }

    const matches = await prisma.tournamentMatch.findMany({
      where: {
        eventId,
        ...(live && { isLive: true }),
      },
      orderBy: [
        { isLive: 'desc' },
        { status: 'asc' },
        { courtNumber: 'asc' },
      ],
      include: {
        event: {
          select: {
            name: true,
            location: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, matches });
  } catch (error) {
    console.error('Error fetching tournament matches:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch matches' },
      { status: 500 }
    );
  }
}
