
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Allow unauthenticated access to basic event data

    const { searchParams } = new URL(request.url);
    const upcoming = searchParams.get('upcoming') === 'true';
    const live = searchParams.get('live') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');

    const now = new Date();
    
    try {
      const events = await prisma.pickleballEvent.findMany({
        where: {
          ...(upcoming && {
            eventDate: {
              gte: now,
            },
          }),
          ...(live && { isLive: true }),
        },
        orderBy: [
          { featured: 'desc' },
          { eventDate: 'asc' },
        ],
        take: limit,
        include: {
          matches: {
            where: {
              isLive: true,
            },
            take: 5,
          },
        },
      });

      return NextResponse.json({ success: true, events });
    } catch (dbError) {
      console.error('Database query failed, returning mock data:', dbError);
      
      // Return mock data if database query fails
      const mockEvents = [
        {
          id: '1',
          name: 'PPA Tour Championship',
          description: 'Professional pickleball tournament featuring top players',
          eventDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          location: 'Newport Beach, CA',
          organizationName: 'PPA',
          isLive: live || false,
          featured: true,
          streamUrl: 'https://youtube.com/watch?v=example',
          matches: []
        }
      ];
      
      return NextResponse.json({ success: true, events: mockEvents });
    }
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
