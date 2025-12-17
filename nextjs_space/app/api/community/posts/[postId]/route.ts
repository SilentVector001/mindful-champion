
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            nickname: true,
            image: true,
            skillLevel: true,
            playerRating: true,
            ageRange: true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                nickname: true,
                image: true,
                playerRating: true,
                ageRange: true
              }
            },
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    nickname: true,
                    image: true,
                    playerRating: true,
                    ageRange: true
                  }
                }
              }
            }
          },
          where: {
            parentId: null
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        likes: {
          where: {
            userId: session.user.id!
          }
        },
        bookmarks: {
          where: {
            userId: session.user.id!
          }
        }
      }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Increment view count
    await prisma.communityPost.update({
      where: { id: postId },
      data: { views: { increment: 1 } }
    })

    return NextResponse.json({
      post: {
        ...post,
        isLiked: post.likes.length > 0,
        isBookmarked: post.bookmarks.length > 0
      }
    })
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const post = await prisma.communityPost.findUnique({
      where: { id: postId }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Only post author or admin can delete
    const user = await prisma.user.findUnique({
      where: { id: session.user.id! }
    })

    if (post.userId !== session.user.id! && user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.communityPost.delete({
      where: { id: postId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    )
  }
}
