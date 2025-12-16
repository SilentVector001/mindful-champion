/**
 * API Route: Single Notification History
 * PATCH: Update notification history (mark as read/clicked)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * PATCH /api/notifications/history/[id]
 * Update notification history (mark as opened/clicked)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await params in Next.js 15+
    const { id } = await params;
    const body = await request.json();
    const { opened, clicked } = body;

    // Verify the history record belongs to the user
    const historyRecord = await prisma.notificationHistory.findUnique({
      where: { id },
    });

    if (!historyRecord) {
      return NextResponse.json(
        { error: 'History record not found' },
        { status: 404 }
      );
    }

    if (historyRecord.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const updated = await prisma.notificationHistory.update({
      where: { id },
      data: {
        opened: opened ?? undefined,
        clicked: clicked ?? undefined,
      },
    });

    return NextResponse.json({ history: updated });
  } catch (error) {
    console.error('Error updating notification history:', error);
    return NextResponse.json(
      { error: 'Failed to update history' },
      { status: 500 }
    );
  }
}
