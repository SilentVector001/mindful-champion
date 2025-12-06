
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Admin endpoint to view all Coach Kai conversations
 * GET: List conversations with filters and pagination
 */
export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const flaggedOnly = searchParams.get('flaggedOnly') === 'true';

    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {};
    
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        {
          user: {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ]
          }
        }
      ];
    }

    // Get conversations with user details
    const [conversations, total] = await Promise.all([
      prisma.aIConversation.findMany({
        where: whereClause,
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 3, // Get last 3 messages for preview
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
              accountLocked: true,
            }
          }
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.aIConversation.count({ where: whereClause })
    ]);

    // Get flagged message counts for each conversation
    const conversationIds = conversations.map((c: any) => c.id);
    const flaggedCounts = await prisma.flaggedMessage.groupBy({
      by: ['conversationId'],
      where: {
        conversationId: { in: conversationIds },
        status: 'PENDING'
      },
      _count: true
    });

    const flaggedMap = new Map(
      flaggedCounts.map((f: any) => [f.conversationId, f._count])
    );

    // Enrich conversations with flagged counts
    const enrichedConversations = conversations.map((conv: any) => ({
      ...conv,
      flaggedCount: flaggedMap.get(conv.id) || 0
    }));

    // Filter by flagged if requested
    const filteredConversations = flaggedOnly
      ? enrichedConversations.filter(c => c.flaggedCount > 0)
      : enrichedConversations;

    return NextResponse.json({
      success: true,
      conversations: filteredConversations,
      pagination: {
        page,
        limit,
        total: flaggedOnly ? filteredConversations.length : total,
        totalPages: Math.ceil((flaggedOnly ? filteredConversations.length : total) / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
