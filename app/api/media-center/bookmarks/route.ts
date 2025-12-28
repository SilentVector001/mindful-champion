
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ContentType } from '@/lib/prisma-types';
import { SubscriptionUtils } from '@/lib/media-center/subscription-utils';

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

    // Get user's tier access
    const tierAccess = await SubscriptionUtils.getUserTierAccess(userId);
    
    if (!tierAccess.canBookmarkContent) {
      return NextResponse.json({
        success: false,
        message: 'Bookmarking requires a subscription',
        upgradeRequired: true
      }, { status: 403 });
    }

    const where: any = { userId };
    if (contentType) {
      where.contentType = contentType;
    }

    const bookmarks = await prisma.contentBookmark.findMany({
      where,
      orderBy: { bookmarkedAt: 'desc' }
    });

    // Also get podcast bookmarks
    const podcastBookmarks = await prisma.podcastBookmark.findMany({
      where: { userId },
      include: {
        episode: {
          include: { show: true }
        }
      },
      orderBy: { bookmarkedAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      contentBookmarks: bookmarks,
      podcastBookmarks,
      tierAccess
    });

  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch bookmarks'
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
    
    // Check if user can bookmark content
    const tierAccess = await SubscriptionUtils.getUserTierAccess(userId);
    if (!tierAccess.canBookmarkContent) {
      return NextResponse.json({
        success: false,
        message: 'Bookmarking requires a subscription',
        upgradeRequired: true
      }, { status: 403 });
    }

    const { 
      contentType, 
      contentId, 
      title, 
      description, 
      thumbnailUrl, 
      url,
      episodeId, // for podcast bookmarks
      notes 
    } = await request.json();

    if (episodeId) {
      // Create podcast bookmark
      const bookmark = await prisma.podcastBookmark.create({
        data: {
          userId,
          episodeId,
          notes
        }
      });

      return NextResponse.json({
        success: true,
        bookmark,
        type: 'podcast'
      });
    } else {
      // Create content bookmark
      const bookmark = await prisma.contentBookmark.create({
        data: {
          userId,
          contentType,
          contentId,
          title,
          description,
          thumbnailUrl,
          url
        }
      });

      return NextResponse.json({
        success: true,
        bookmark,
        type: 'content'
      });
    }

  } catch (error) {
    console.error('Error creating bookmark:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create bookmark'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
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
    const bookmarkId = searchParams.get('id');
    const episodeId = searchParams.get('episodeId');

    if (episodeId) {
      // Delete podcast bookmark
      await prisma.podcastBookmark.deleteMany({
        where: {
          userId,
          episodeId
        }
      });
    } else if (bookmarkId) {
      // Delete content bookmark
      await prisma.contentBookmark.deleteMany({
        where: {
          id: bookmarkId,
          userId // Ensure user can only delete their own bookmarks
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Bookmark removed'
    });

  } catch (error) {
    console.error('Error deleting bookmark:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete bookmark'
    }, { status: 500 });
  }
}
