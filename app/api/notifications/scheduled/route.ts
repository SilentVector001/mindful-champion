import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { addDays } from 'date-fns';

export const dynamic = 'force-dynamic';

// GET - Fetch upcoming scheduled notifications (next 7 days)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');

    const now = new Date();
    const futureDate = addDays(now, days);

    // Fetch scheduled notifications within the time range
    const scheduled = await prisma.scheduledNotification.findMany({
      where: {
        userId: session.user.id,
        status: 'PENDING',
        scheduledFor: {
          gte: now,
          lte: futureDate,
        },
      },
      orderBy: {
        scheduledFor: 'asc',
      },
    });

    // Group by date
    const groupedByDate = scheduled.reduce((acc: any, notification) => {
      const date = notification.scheduledFor.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(notification);
      return acc;
    }, {});

    return NextResponse.json({
      scheduled,
      groupedByDate,
      total: scheduled.length,
    });
  } catch (error) {
    console.error('Error fetching scheduled notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scheduled notifications' },
      { status: 500 }
    );
  }
}
