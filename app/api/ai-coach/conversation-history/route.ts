
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET: Retrieve user's conversation history with Coach Kai
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get or create user's conversation
    let conversation = await prisma.aIConversation.findFirst({
      where: { userId: session.user.id },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: limit
        }
      }
    });

    if (!conversation) {
      // Create new conversation for user
      conversation = await prisma.aIConversation.create({
        data: {
          userId: session.user.id,
          title: 'Coach Kai Conversation',
          messageCount: 0
        },
        include: {
          messages: true
        }
      });
    }

    // Get user context for personalization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        firstName: true,
        skillLevel: true,
        primaryGoals: true,
        biggestChallenges: true,
        avatarName: true,
        playerRating: true
      }
    });

    return NextResponse.json({
      success: true,
      conversation: {
        id: conversation.id,
        messages: conversation.messages.reverse(), // Show oldest first
        messageCount: conversation.messageCount
      },
      userContext: user
    });

  } catch (error) {
    console.error('Error fetching conversation history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation history' },
      { status: 500 }
    );
  }
}

// POST: Save a new message to conversation history
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { role, content } = await request.json();

    if (!role || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get or create conversation
    let conversation = await prisma.aIConversation.findFirst({
      where: { userId: session.user.id }
    });

    if (!conversation) {
      conversation = await prisma.aIConversation.create({
        data: {
          userId: session.user.id,
          title: 'Coach Kai Conversation',
          messageCount: 0
        }
      });
    }

    // Save message
    const message = await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        userId: session.user.id,
        role: role,
        content: content
      }
    });

    // Update conversation message count
    await prisma.aIConversation.update({
      where: { id: conversation.id },
      data: {
        messageCount: { increment: 1 },
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        role: message.role,
        content: message.content,
        createdAt: message.createdAt
      }
    });

  } catch (error) {
    console.error('Error saving message:', error);
    return NextResponse.json(
      { error: 'Failed to save message' },
      { status: 500 }
    );
  }
}
