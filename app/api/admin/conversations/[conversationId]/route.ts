
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Admin endpoint to view a specific conversation in detail
 * GET: Get full conversation with all messages and user details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;
    const session = await getServerSession(authOptions);
    
    // Check admin authorization
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

    
    if (!conversationId || conversationId.trim() === '') {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
    }

    // Get conversation with all messages and user details
    let conversation;
    try {
      conversation = await prisma.aIConversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              firstName: true,
              lastName: true,
              skillLevel: true,
              playerRating: true,
              primaryGoals: true,
              biggestChallenges: true,
              accountLocked: true,
              accountLockedReason: true,
              createdAt: true,
              lastActiveDate: true,
            }
          }
        }
      });
    } catch (error) {
      console.error('Error fetching conversation details:', error);
      return NextResponse.json(
        { error: 'Failed to fetch conversation details', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Get flagged messages for this conversation
    let flaggedMessages: any[] = [];
    try {
      flaggedMessages = await prisma.flaggedMessage.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      console.error('Error fetching flagged messages:', error);
      // Continue without flagged messages
    }

    // Get admin notes for this user
    let adminNotes: any[] = [];
    try {
      adminNotes = await prisma.adminNote.findMany({
        where: { userId: conversation.userId },
        orderBy: { createdAt: 'desc' },
        take: 10
      });
    } catch (error) {
      console.error('Error fetching admin notes:', error);
      // Continue without admin notes
    }

    // Get user warnings
    let userWarnings: any[] = [];
    try {
      userWarnings = await prisma.userWarning.findMany({
        where: { userId: conversation.userId },
        orderBy: { createdAt: 'desc' },
        take: 10
      });
    } catch (error) {
      console.error('Error fetching user warnings:', error);
      // Continue without user warnings
    }

    return NextResponse.json({
      success: true,
      conversation,
      flaggedMessages,
      adminNotes,
      userWarnings
    });

  } catch (error) {
    console.error('Error in conversation details endpoint:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch conversation', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
