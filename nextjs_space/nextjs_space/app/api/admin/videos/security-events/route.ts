
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Create security event related to a video
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      videoId,
      userId,
      eventType,
      severity = 'MEDIUM',
      description,
      customMessage
    } = body;

    if (!videoId || !userId || !eventType || !description) {
      return NextResponse.json(
        { error: 'Video ID, user ID, event type, and description are required' },
        { status: 400 }
      );
    }

    // Verify video exists
    const video = await prisma.videoAnalysis.findUnique({
      where: { id: videoId },
      select: { 
        id: true, 
        title: true, 
        userId: true,
        fileName: true
      }
    });

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    if (video.userId !== userId) {
      return NextResponse.json({ error: 'Video does not belong to specified user' }, { status: 400 });
    }

    // Create security log
    const securityLog = await prisma.securityLog.create({
      data: {
        userId,
        eventType,
        severity,
        description,
        metadata: {
          videoId,
          adminId: session.user.id,
          videoTitle: video.title,
          fileName: video.fileName,
          customMessage,
          timestamp: new Date().toISOString()
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      securityLog,
      message: 'Security event created successfully'
    });

  } catch (error) {
    console.error('Failed to create security event:', error);
    return NextResponse.json(
      { error: 'Failed to create security event' },
      { status: 500 }
    );
  }
}

// Get video-related security events for a user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const videoId = searchParams.get('videoId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      eventType: {
        in: [
          'ADMIN_VIDEO_UPLOADED',
          'ADMIN_VIDEO_FLAGGED', 
          'ADMIN_VIDEO_DELETED',
          'ADMIN_VIDEO_REVIEWED',
          'ADMIN_VIDEO_NOTES_UPDATED'
        ]
      }
    };

    if (userId) {
      where.userId = userId;
    }

    if (videoId) {
      where.metadata = {
        path: ['videoId'],
        equals: videoId
      };
    }

    const securityLogs = await prisma.securityLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            name: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      skip,
      take: limit
    });

    const totalCount = await prisma.securityLog.count({ where });

    return NextResponse.json({
      events: securityLogs,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + limit < totalCount
      }
    });

  } catch (error) {
    console.error('Failed to fetch security events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch security events' },
      { status: 500 }
    );
  }
}
