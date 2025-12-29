
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * Admin endpoint to view a specific user's Coach Kai conversations
 * GET: Get all conversations for a user
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
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

    const { userId } = await params;

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        firstName: true,
        lastName: true,
        skillLevel: true,
        playerRating: true,
        accountLocked: true,
        createdAt: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all conversations for this user
    const conversations = await prisma.aIConversation.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Get flagged messages for these conversations
    const conversationIds = conversations.map(c => c.id);
    const flaggedMessages = await prisma.flaggedMessage.findMany({
      where: { conversationId: { in: conversationIds } },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      user,
      conversations,
      flaggedMessages
    });

  } catch (error) {
    console.error('Error fetching user conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user conversations' },
      { status: 500 }
    );
  }
}
