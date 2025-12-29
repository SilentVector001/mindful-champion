import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/navigation-events
 * Get recent navigation events for admin dashboard
 * Admin only endpoint
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const userId = searchParams.get('userId');

    // Get recent page views with user info
    const pageViews = await prisma.pageView.findMany({
      where: userId ? { userId } : {},
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: {
        session: {
          select: {
            sessionId: true,
            deviceType: true,
            browser: true,
            os: true,
          },
        },
      },
    });

    // Get user info for page views
    const userIds = [...new Set(pageViews.map((pv) => pv.userId).filter(Boolean))] as string[];
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    // Format navigation events
    const navigationEvents = pageViews.map((pv) => {
      const user = pv.userId ? userMap.get(pv.userId) : null;
      
      return {
        id: pv.id,
        userId: pv.userId,
        userName: user?.name || 'Anonymous',
        userEmail: user?.email,
        userImage: user?.image,
        path: pv.path,
        title: pv.title,
        duration: pv.duration,
        timestamp: pv.timestamp,
        sessionId: pv.sessionId,
        deviceType: pv.session?.deviceType,
        browser: pv.session?.browser,
        os: pv.session?.os,
      };
    });

    return NextResponse.json({ navigationEvents });
  } catch (error) {
    console.error('Navigation events error:', error);
    return NextResponse.json(
      { error: 'Failed to get navigation events' },
      { status: 500 }
    );
  }
}
