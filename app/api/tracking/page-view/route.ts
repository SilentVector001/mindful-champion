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

    // Parse device info from user agent
    const ua = userAgent?.toLowerCase() || '';
    let deviceType = 'desktop';
    let browser = 'Unknown';
    let os = 'Unknown';

    // Detect device type
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      deviceType = 'mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      deviceType = 'tablet';
    }

    // Detect browser
    if (ua.includes('chrome')) browser = 'Chrome';
    else if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('safari')) browser = 'Safari';
    else if (ua.includes('edge')) browser = 'Edge';

    // Detect OS
    if (ua.includes('windows')) os = 'Windows';
    else if (ua.includes('mac')) os = 'macOS';
    else if (ua.includes('linux')) os = 'Linux';
    else if (ua.includes('android')) os = 'Android';
    else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';

    const userSession = await prisma.userSession.upsert({
      where: { sessionId },
      create: {
        id: `us_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        sessionId,
        userId: userId || null,
        startTime: new Date(),
        ipAddress,
        userAgent,
        deviceType,
        browser,
        os,
        isActive: true,
      },
      update: {
        isActive: true,
        endTime: null, // Session is active again
        deviceType,
        browser,
        os,
      },
    });

    // Create page view - IMPORTANT: Use userSession.id, not the browser sessionId!
    const pageView = await prisma.pageView.create({
      data: {
        userId: userId || null,
        sessionId: userSession.id, // Use the database ID, not the browser sessionId
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
