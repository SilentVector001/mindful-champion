
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where = category && category !== 'ALL' 
      ? { category: category as any }
      : {}

    const posts = await prisma.communityPost.findMany({
      where,
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
        _count: {
          select: {
            comments: true,
            likes: true
          }
        }
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 100
    })

    const postsWithCounts = posts.map(post => ({
      ...post,
      likeCount: post._count.likes,
      commentCount: post._count.comments
    }))

    return NextResponse.json({ posts: postsWithCounts })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, content, category } = await request.json()

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    const post = await prisma.communityPost.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        category: category || 'GENERAL',
        userId: session.user.id!
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

    // Initialize or update community stats
    await prisma.communityStats.upsert({
      where: { userId: session.user.id! },
      create: {
        userId: session.user.id!,
        postsCount: 1,
        commentsCount: 0,
        likesReceived: 0,
        helpfulVotes: 0,
        lastActiveAt: new Date()
      },
      update: {
        postsCount: { increment: 1 },
        lastActiveAt: new Date()
      }
    })

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}
