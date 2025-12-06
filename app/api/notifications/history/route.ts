import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NotificationCategory } from '@prisma/client';
import { startOfDay, endOfDay, subDays } from 'date-fns';

export const dynamic = 'force-dynamic';

// GET - Fetch notification history with filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as NotificationCategory | null;
    const dateRange = searchParams.get('dateRange') || '30'; // days
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const now = new Date();
    const startDate = startOfDay(subDays(now, parseInt(dateRange)));
    const endDate = endOfDay(now);

    // Build where clause
    const where: any = {
      userId: session.user.id,
      sentAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (category) {
      where.category = category;
    }

    // Fetch history with pagination
    const [history, total] = await Promise.all([
      prisma.notificationHistory.findMany({
        where,
        orderBy: {
          deliveredAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notificationHistory.count({ where }),
    ]);

    // Calculate analytics
    const [totalSent, totalOpened, totalClicked] = await Promise.all([
      prisma.notificationHistory.count({
        where: {
          userId: session.user.id,
          deliveredAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      prisma.notificationHistory.count({
        where: {
          userId: session.user.id,
          deliveredAt: {
            gte: startDate,
            lte: endDate,
          },
          opened: true,
        },
      }),
      prisma.notificationHistory.count({
        where: {
          userId: session.user.id,
          deliveredAt: {
            gte: startDate,
            lte: endDate,
          },
          clicked: true,
        },
      }),
    ]);

    const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
    const clickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;

    return NextResponse.json({
      history,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      analytics: {
        totalSent,
        totalOpened,
        totalClicked,
        openRate: Math.round(openRate * 10) / 10,
        clickRate: Math.round(clickRate * 10) / 10,
      },
    });
  } catch (error) {
    console.error('Error fetching notification history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification history' },
      { status: 500 }
    );
  }
}
