
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

    const existingLike = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId: postId,
          userId: session.user.id!
        }
      }
    })

    if (existingLike) {
      // Unlike
      await prisma.postLike.delete({
        where: { id: existingLike.id }
      })
      
      await prisma.communityPost.update({
        where: { id: postId },
        data: { likeCount: { decrement: 1 } }
      })

      return NextResponse.json({ liked: false })
    } else {
      // Like
      await prisma.postLike.create({
        data: {
          postId: postId,
          userId: session.user.id!
        }
      })

      await prisma.communityPost.update({
        where: { id: postId },
        data: { likeCount: { increment: 1 } }
      })

      // Update post author's stats
      const post = await prisma.communityPost.findUnique({
        where: { id: postId },
        select: { userId: true }
      })

      if (post) {
        await prisma.communityStats.upsert({
          where: { userId: post.userId },
          create: {
            userId: post.userId,
            postsCount: 0,
            commentsCount: 0,
            likesReceived: 1,
            helpfulVotes: 0
          },
          update: {
            likesReceived: { increment: 1 }
          }
        })
      }

      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error('Error toggling like:', error)
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    )
  }
}
