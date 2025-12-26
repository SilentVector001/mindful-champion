
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const userId = searchParams.get('userId');
    const adminUpload = searchParams.get('adminUpload') === 'true';
    const reviewStatus = searchParams.get('reviewStatus');
    const flaggedOnly = searchParams.get('flaggedOnly') === 'true';
    const priority = searchParams.get('priority');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'uploadedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      AND: []
    };

    if (userId) {
      where.AND.push({ userId });
    }

    if (adminUpload) {
      where.AND.push({ adminUpload: true });
    }

    if (reviewStatus) {
      where.AND.push({ reviewStatus });
    }

    if (flaggedOnly) {
      where.AND.push({ flaggedForReview: true });
    }

    if (priority) {
      where.AND.push({ adminPriority: priority });
    }

    if (search) {
      where.AND.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { fileName: { contains: search, mode: 'insensitive' } },
          { adminNotes: { contains: search, mode: 'insensitive' } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
          { user: { firstName: { contains: search, mode: 'insensitive' } } },
          { user: { lastName: { contains: search, mode: 'insensitive' } } }
        ]
      });
    }

    // Get total count
    const totalCount = await prisma.videoAnalysis.count({ where });

    // Get videos
    const videos = await prisma.videoAnalysis.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            name: true,
            skillLevel: true
          }
        },
        uploadedByAdmin: {
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
        [sortBy]: sortOrder
      },
      skip,
      take: limit
    });

    // Get summary stats
    const stats = await prisma.videoAnalysis.aggregate({
      where: { adminUpload: true },
      _count: {
        id: true
      }
    });

    const flaggedCount = await prisma.videoAnalysis.count({
      where: { flaggedForReview: true }
    });

    const pendingReviewCount = await prisma.videoAnalysis.count({
      where: { reviewStatus: 'PENDING', adminUpload: true }
    });

    const response = {
      videos,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + limit < totalCount
      },
      stats: {
        totalAdminUploads: stats._count.id,
        flaggedVideos: flaggedCount,
        pendingReviews: pendingReviewCount
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Failed to fetch admin videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}
