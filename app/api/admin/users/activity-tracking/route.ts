
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET detailed user activity tracking
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    // Get user's basic info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        lastActiveDate: true,
        loginCount: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user sessions
    const sessions = await prisma.userSession.findMany({
      where: { userId },
      orderBy: { startTime: 'desc' },
      take: limit,
      select: {
        id: true,
        startTime: true,
        endTime: true,
        duration: true,
        deviceType: true,
        ipAddress: true,
        isActive: true
      }
    });

    // Get page views with session info
    const pageViews = await prisma.pageView.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      select: {
        id: true,
        path: true,
        title: true,
        timestamp: true,
        duration: true,
        sessionId: true
      }
    });

    // Get video interactions
    const videoInteractions = await prisma.videoInteraction.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 30,
      select: {
        id: true,
        videoId: true,
        videoTitle: true,
        interactionType: true,
        timestamp: true,
        currentTime: true
      }
    });

    // Get AI coaching conversations
    const aiConversations = await prisma.aIConversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        messageCount: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Calculate activity statistics
    const totalPageViews = pageViews.length;
    const uniquePages = new Set(pageViews.map(pv => pv.path)).size;
    const avgSessionDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / (sessions.length || 1);
    const totalVideoInteractions = videoInteractions.length;
    const totalAIMessages = aiConversations.reduce((sum, conv) => sum + conv.messageCount, 0);

    // Get most visited pages
    const pageCounts: Record<string, number> = {};
    pageViews.forEach(pv => {
      pageCounts[pv.path] = (pageCounts[pv.path] || 0) + 1;
    });
    const mostVisitedPages = Object.entries(pageCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([path, count]) => ({ path, visits: count }));

    // User journey (recent navigation flow)
    const recentJourney = pageViews.slice(0, 20).map(pv => ({
      page: pv.path,
      title: pv.title,
      timestamp: pv.timestamp,
      duration: pv.duration
    }));

    return NextResponse.json({
      success: true,
      user,
      statistics: {
        totalSessions: sessions.length,
        avgSessionDuration: Math.round(avgSessionDuration),
        totalPageViews,
        uniquePagesVisited: uniquePages,
        totalVideoInteractions,
        totalAIMessages,
        lastActive: user.lastActiveDate,
        totalLogins: user.loginCount
      },
      sessions,
      recentJourney,
      mostVisitedPages,
      videoInteractions: videoInteractions.slice(0, 10),
      aiConversations
    });

  } catch (error) {
    console.error('Error fetching user activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user activity' },
      { status: 500 }
    );
  }
}
