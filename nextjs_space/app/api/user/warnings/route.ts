
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * User endpoint for warnings
 * GET: Get all warnings for the current user (especially unread ones)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const unreadOnly = url.searchParams.get('unreadOnly') === 'true';

    const whereClause: any = {
      userId: session.user.id
    };

    if (unreadOnly) {
      whereClause.notificationSeen = false;
    }

    const warnings = await prisma.userWarning.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    const unreadCount = await prisma.userWarning.count({
      where: {
        userId: session.user.id,
        notificationSeen: false
      }
    });

    return NextResponse.json({
      success: true,
      warnings,
      unreadCount
    });

  } catch (error) {
    console.error('Error fetching user warnings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch warnings' },
      { status: 500 }
    );
  }
}
