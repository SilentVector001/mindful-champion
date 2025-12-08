import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/emails/history
 * Fetch email notification history with filters and pagination
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Filters
    const typeFilter = searchParams.get('type');
    const statusFilter = searchParams.get('status');
    const searchQuery = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const userId = searchParams.get('userId');

    // Build where clause
    const where: any = {};

    if (typeFilter) {
      where.type = typeFilter;
    }

    if (statusFilter) {
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
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Fetch emails with pagination
    const [emails, totalCount] = await Promise.all([
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

    // Get statistics
    const stats = await prisma.emailNotification.groupBy({
      by: ['status'],
      _count: true,
      where: userId ? { userId } : {},
    });

    const statsMap = stats.reduce((acc: any, stat) => {
      acc[stat.status] = stat._count;
      return acc;
    }, {});

    // Get type distribution
    const typeDistribution = await prisma.emailNotification.groupBy({
      by: ['type'],
      _count: true,
      orderBy: {
        _count: {
          type: 'desc',
        },
      },
      take: 10,
    });

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      emails: emails.map((email) => ({
        ...email,
        // Create content preview
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
      typeDistribution: typeDistribution.map((td) => ({
        type: td.type,
        count: td._count,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching email history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email history', details: error.message },
      { status: 500 }
    );
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
