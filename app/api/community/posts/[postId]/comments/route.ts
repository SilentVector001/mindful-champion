
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content, parentId } = await request.json()

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    const comment = await prisma.postComment.create({
      data: {
        content: content.trim(),
        postId: postId,
        userId: session.user.id!,
        parentId: parentId || null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    })

    // Update post comment count
    await prisma.communityPost.update({
      where: { id: postId },
      data: { commentCount: { increment: 1 } }
    })

    // Update user's community stats
    await prisma.communityStats.upsert({
      where: { userId: session.user.id! },
      create: {
        userId: session.user.id!,
        postsCount: 0,
        commentsCount: 1,
        likesReceived: 0,
        helpfulVotes: 0,
        lastActiveAt: new Date()
      },
      update: {
        commentsCount: { increment: 1 },
        lastActiveAt: new Date()
      }
    })

    return NextResponse.json({ comment })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}
