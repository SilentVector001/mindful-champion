
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * Admin endpoint to flag/unflag messages
 * POST: Flag a message for review
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (admin?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { messageId, conversationId, userId, reason, reviewNotes } = await req.json();

    if (!messageId || !conversationId || !userId || !reason) {
      return NextResponse.json({ 
        error: 'Message ID, conversation ID, user ID, and reason are required' 
      }, { status: 400 });
    }

    const flagged = await prisma.flaggedMessage.create({
      data: {
        messageId,
        conversationId,
        userId,
        flaggedBy: session.user.id,
        reason,
        reviewNotes: reviewNotes || null
      }
    });

    return NextResponse.json({
      success: true,
      flagged
    });

  } catch (error) {
    console.error('Error flagging message:', error);
    return NextResponse.json(
      { error: 'Failed to flag message' },
      { status: 500 }
    );
  }
}

/**
 * PUT: Update flag status (review, resolve, dismiss)
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (admin?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { flagId, status, reviewNotes } = await req.json();

    if (!flagId || !status) {
      return NextResponse.json({ 
        error: 'Flag ID and status are required' 
      }, { status: 400 });
    }

    const updated = await prisma.flaggedMessage.update({
      where: { id: flagId },
      data: {
        status,
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
        reviewNotes: reviewNotes || null
      }
    });

    return NextResponse.json({
      success: true,
      flagged: updated
    });

  } catch (error) {
    console.error('Error updating flag:', error);
    return NextResponse.json(
      { error: 'Failed to update flag' },
      { status: 500 }
    );
  }
}
