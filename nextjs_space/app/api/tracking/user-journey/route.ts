// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/tracking/user-journey?userId={userId}
 * Get complete user journey with sessions and page views
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
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');
    const days = parseInt(searchParams.get('days') || '7');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId required' },
        { status: 400 }
      );
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get user sessions
    const sessions = await prisma.userSession.findMany({
      where: {
        userId,
        ...(sessionId ? { sessionId } : {}),
        startTime: {
          gte: startDate,
        },
      },
      include: {
        pageViews: {
          orderBy: { timestamp: 'asc' },
        },
      },
      orderBy: { startTime: 'desc' },
    });

    // Format journey data
    const journey = sessions.map((session) => ({
      sessionId: session.sessionId,
      startTime: session.startTime,
      endTime: session.endTime,
      duration: session.duration,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      deviceType: session.deviceType,
      browser: session.browser,
      os: session.os,
      pageViews: session.pageViews.map((pv) => ({
        path: pv.path,
        title: pv.title,
        timestamp: pv.timestamp,
        duration: pv.duration,
        referrer: pv.referrer,
      })),
      totalPages: session.pageViews.length,
    }));

    // Get summary stats
    const totalSessions = sessions.length;
    const totalPageViews = sessions.reduce(
      (acc, s) => acc + s.pageViews.length,
      0
    );
    const avgPagesPerSession =
      totalSessions > 0 ? totalPageViews / totalSessions : 0;

    // Get most visited pages
    const pageViewCounts: Record<string, number> = {};
    sessions.forEach((session) => {
      session.pageViews.forEach((pv) => {
        pageViewCounts[pv.path] = (pageViewCounts[pv.path] || 0) + 1;
      });
    });

    const mostVisitedPages = Object.entries(pageViewCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([path, count]) => ({ path, count }));

    return NextResponse.json({
      journey,
      stats: {
        totalSessions,
        totalPageViews,
        avgPagesPerSession: avgPagesPerSession.toFixed(1),
        mostVisitedPages,
      },
    });
  } catch (error) {
    console.error('User journey error:', error);
    return NextResponse.json(
      { error: 'Failed to get user journey' },
      { status: 500 }
    );
  }
}
