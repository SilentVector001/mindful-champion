import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const recipient = searchParams.get('recipient');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build filter
    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (recipient) {
      where.recipientEmail = {
        contains: recipient,
        mode: 'insensitive',
      };
    }

    if (dateFrom || dateTo) {
      where.sentAt = {};
      if (dateFrom) {
        where.sentAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.sentAt.lte = new Date(dateTo);
      }
    }

    // Get emails
    const emails = await prisma.emailNotification.findMany({
      where,
      orderBy: { sentAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Get total count
    const total = await prisma.emailNotification.count({ where });

    // Get stats
    const stats = {
      total,
      sent: await prisma.emailNotification.count({
        where: { ...where, status: 'SENT' },
      }),
      failed: await prisma.emailNotification.count({
        where: { ...where, status: 'FAILED' },
      }),
      pending: await prisma.emailNotification.count({
        where: { ...where, status: 'PENDING' },
      }),
    };

    return NextResponse.json({
      emails,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
      stats,
    });
  } catch (error: any) {
    console.error('Error fetching email history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email history', details: error.message },
      { status: 500 }
    );
  }
}
