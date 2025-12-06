/**
 * API Route: Single Scheduled Notification
 * DELETE: Cancel a scheduled notification
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { cancelNotification } from '@/lib/notifications/notification-service';
import { prisma } from '@/lib/db';

/**
 * DELETE /api/notifications/scheduled/[id]
 * Cancel a scheduled notification
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Verify the notification belongs to the user
    const notification = await prisma.scheduledNotification.findUnique({
      where: { id },
    });

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    if (notification.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await cancelNotification(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error cancelling notification:', error);
    return NextResponse.json(
      { error: 'Failed to cancel notification' },
      { status: 500 }
    );
  }
}
