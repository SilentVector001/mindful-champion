
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ContentType } from '@prisma/client';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get('contentType') as ContentType;
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = { userId };
    if (contentType) {
      where.contentType = contentType;
    }

    const watchHistory = await prisma.userWatchHistory.findMany({
      where,
      orderBy: { watchedAt: 'desc' },
      take: limit
    });

    return NextResponse.json({
      success: true,
      watchHistory
    });

  } catch (error) {
    console.error('Error fetching watch history:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch watch history'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }

    const userId = session.user.id;
    const { 
      contentType, 
      contentId, 
      title, 
      description, 
      thumbnailUrl, 
      url,
      watchedDuration,
      totalDuration,
      completed,
      lastPosition
    } = await request.json();

    const watchHistory = await prisma.userWatchHistory.upsert({
      where: {
        userId_contentType_contentId: {
          userId,
          contentType,
          contentId
        }
      },
      update: {
        watchedDuration: watchedDuration || 0,
        totalDuration: totalDuration || undefined,
        completed: completed || false,
        lastPosition: lastPosition || 0,
        watchedAt: new Date()
      },
      create: {
        userId,
        contentType,
        contentId,
        title,
        description,
        thumbnailUrl,
        url,
        watchedDuration: watchedDuration || 0,
        totalDuration: totalDuration || undefined,
        completed: completed || false,
        lastPosition: lastPosition || 0
      }
    });

    return NextResponse.json({
      success: true,
      watchHistory
    });

  } catch (error) {
    console.error('Error updating watch history:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update watch history'
    }, { status: 500 });
  }
}
