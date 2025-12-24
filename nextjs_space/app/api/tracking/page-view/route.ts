import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * POST /api/tracking/page-view
 * Track a new page view
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, sessionId, path, title, referrer } = body;

    if (!sessionId || !path) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create or update user session
    const userAgent = request.headers.get('user-agent') || undefined;
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     undefined;

    await prisma.userSession.upsert({
      where: { sessionId },
      create: {
        sessionId,
        userId: userId || null,
        startTime: new Date(),
        ipAddress,
        userAgent,
        isActive: true,
      },
      update: {
        isActive: true,
        endTime: null, // Session is active again
      },
    });

    // Create page view
    const pageView = await prisma.pageView.create({
      data: {
        userId: userId || null,
        sessionId,
        path,
        title: title || null,
        referrer: referrer || null,
        timestamp: new Date(),
      },
    });

    return NextResponse.json({ 
      success: true, 
      pageViewId: pageView.id 
    });
  } catch (error) {
    console.error('Page view tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track page view' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/tracking/page-view
 * Update page view duration
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { pageViewId, duration } = body;

    if (!pageViewId || duration === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update page view with duration and left time
    await prisma.pageView.updateMany({
      where: {
        id: pageViewId,
      },
      data: {
        duration,
        leftAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Duration update error:', error);
    return NextResponse.json(
      { error: 'Failed to update duration' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/tracking/page-view?userId={userId}&sessionId={sessionId}
 * Get page views for a user or session
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit') || '100');

    if (!userId && !sessionId) {
      return NextResponse.json(
        { error: 'userId or sessionId required' },
        { status: 400 }
      );
    }

    const where: any = {};
    if (userId) where.userId = userId;
    if (sessionId) where.sessionId = sessionId;

    const pageViews = await prisma.pageView.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return NextResponse.json({ pageViews });
  } catch (error) {
    console.error('Get page views error:', error);
    return NextResponse.json(
      { error: 'Failed to get page views' },
      { status: 500 }
    );
  }
}
