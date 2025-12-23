import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/emails/history
 * Fetch email notification history with filters and pagination
 * Returns empty data gracefully if no emails exist
 */
export async function GET(request: NextRequest) {
  // Default empty response to return on any error
  const emptyResponse = {
    emails: [],
    pagination: {
      page: 1,
      limit: 20,
      totalCount: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
    statistics: {
      total: 0,
      sent: 0,
      failed: 0,
      pending: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
    },
    typeDistribution: [],
  };

  try {
    // Authenticate admin
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1') || 1;
    const limit = parseInt(searchParams.get('limit') || '20') || 20;
    const skip = (page - 1) * limit;

    // Filters - support both 'search' and 'recipient' params
    const typeFilter = searchParams.get('type');
    const statusFilter = searchParams.get('status');
    const searchQuery = searchParams.get('search') || searchParams.get('recipient');
    const startDate = searchParams.get('startDate') || searchParams.get('dateFrom');
    const endDate = searchParams.get('endDate') || searchParams.get('dateTo');
    const userId = searchParams.get('userId');

    // Build where clause
    const where: any = {};

    if (typeFilter && typeFilter !== 'all') {
      where.type = typeFilter;
    }

    if (statusFilter && statusFilter !== 'all') {
      where.status = statusFilter;
    }

    if (userId) {
      where.userId = userId;
    }

    if (searchQuery) {
      where.OR = [
        { recipientEmail: { contains: searchQuery, mode: 'insensitive' } },
        { recipientName: { contains: searchQuery, mode: 'insensitive' } },
        { subject: { contains: searchQuery, mode: 'insensitive' } },
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        try {
          where.createdAt.gte = new Date(startDate);
        } catch (e) {
          console.error('Invalid startDate:', startDate);
        }
      }
      if (endDate) {
        try {
          where.createdAt.lte = new Date(endDate);
        } catch (e) {
          console.error('Invalid endDate:', endDate);
        }
      }
      // Remove empty createdAt filter
      if (Object.keys(where.createdAt).length === 0) {
        delete where.createdAt;
      }
    }

    // Fetch emails with pagination - wrapped in try-catch
    let emails: any[] = [];
    let totalCount = 0;
    
    try {
      [emails, totalCount] = await Promise.all([
        prisma.emailNotification.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.emailNotification.count({ where }),
      ]);
    } catch (dbError: any) {
      console.error('Database error fetching emails:', dbError?.message || dbError);
      // Return empty response instead of error
      return NextResponse.json(emptyResponse);
    }

    // Get statistics - wrapped in try-catch for better error handling
    let statsMap: Record<string, number> = {};
    let typeDistribution: Array<{ type: string; count: number }> = [];
    
    try {
      const stats = await prisma.emailNotification.groupBy({
        by: ['status'],
        _count: {
          status: true,
        },
        where: userId ? { userId } : undefined,
      });

      statsMap = stats.reduce((acc: Record<string, number>, stat) => {
        acc[stat.status] = stat._count.status;
        return acc;
      }, {});
    } catch (statsError: any) {
      console.error('Error fetching email stats:', statsError?.message || statsError);
      // Continue with empty stats
    }

    // Get type distribution
    try {
      const typeDistResult = await prisma.emailNotification.groupBy({
        by: ['type'],
        _count: {
          type: true,
        },
        orderBy: {
          _count: {
            type: 'desc',
          },
        },
        take: 10,
      });
      
      typeDistribution = typeDistResult.map((td) => ({
        type: td.type,
        count: td._count.type,
      }));
    } catch (typeError: any) {
      console.error('Error fetching type distribution:', typeError?.message || typeError);
      // Continue with empty distribution
    }

    const totalPages = Math.ceil(totalCount / limit) || 0;

    return NextResponse.json({
      emails: emails.map((email) => ({
        ...email,
        // Create content preview safely
        contentPreview: email.htmlContent
          ? email.htmlContent
              .replace(/<[^>]*>/g, '')
              .substring(0, 200) + '...'
          : null,
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      statistics: {
        total: totalCount,
        sent: statsMap.SENT || 0,
        failed: statsMap.FAILED || 0,
        pending: statsMap.PENDING || 0,
        delivered: statsMap.DELIVERED || 0,
        opened: statsMap.OPENED || 0,
        clicked: statsMap.CLICKED || 0,
        bounced: statsMap.BOUNCED || 0,
      },
      typeDistribution,
    });
  } catch (error: any) {
    console.error('Error fetching email history:', error?.message || error);
    // Return empty response instead of 500 error
    return NextResponse.json(emptyResponse);
  }
}

/**
 * GET /api/admin/emails/history/[id]
 * Fetch a single email notification by ID
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { emailId } = body;

    if (!emailId) {
      return NextResponse.json(
        { error: 'Email ID is required' },
        { status: 400 }
      );
    }

    // Fetch email details
    const email = await prisma.emailNotification.findUnique({
      where: { id: emailId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            name: true,
          },
        },
        videoAnalysis: {
          select: {
            id: true,
            videoUrl: true,
            analysisStatus: true,
          },
        },
      },
    });

    if (!email) {
      return NextResponse.json(
        { error: 'Email notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ email });
  } catch (error: any) {
    console.error('Error fetching email details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email details', details: error.message },
      { status: 500 }
    );
  }
}
