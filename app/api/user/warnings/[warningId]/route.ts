
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * User endpoint for managing individual warnings
 * PATCH: Mark warning as seen or acknowledged
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ warningId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { warningId } = await params;
    const { action } = await req.json();

    // Verify the warning belongs to the user
    const warning = await prisma.userWarning.findFirst({
      where: {
        id: warningId,
        userId: session.user.id
      }
    });

    if (!warning) {
      return NextResponse.json({ error: 'Warning not found' }, { status: 404 });
    }

    let updateData: any = {};

    if (action === 'markSeen') {
      updateData = {
        notificationSeen: true,
        notificationSeenAt: new Date()
      };
    } else if (action === 'acknowledge') {
      updateData = {
        acknowledged: true,
        acknowledgedAt: new Date(),
        notificationSeen: true,
        notificationSeenAt: new Date()
      };
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const updatedWarning = await prisma.userWarning.update({
      where: { id: warningId },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      warning: updatedWarning
    });

  } catch (error) {
    console.error('Error updating warning:', error);
    return NextResponse.json(
      { error: 'Failed to update warning' },
      { status: 500 }
    );
  }
}
