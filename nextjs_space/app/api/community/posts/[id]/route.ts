import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

// GET: Single post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const post = await prisma.communityPost.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: { id: true, name: true, image: true, skillLevel: true }
        },
        videoAnalysis: {
          select: {
            id: true,
            videoUrl: true,
            thumbnailUrl: true,
            title: true,
            duration: true,
            overallScore: true,
            strengths: true,
            areasForImprovement: true
          }
        },
        likes: {
          where: { userId: user.id },
          select: { id: true }
        },
        bookmarks: {
          where: { userId: user.id },
          select: { id: true }
        },
        _count: {
          select: { comments: true, likes: true }
        }
      }
    })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Increment views
    await prisma.communityPost.update({
      where: { id: params.id },
      data: { views: { increment: 1 } }
    })

    return NextResponse.json({
      ...post,
      isLiked: post.likes.length > 0,
      isSaved: post.bookmarks.length > 0,
      likeCount: post._count.likes,
      commentCount: post._count.comments
    })
  } catch (error) {
    console.error("Error fetching post:", error)
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 })
  }
}

// PUT: Update post (caption/tags)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const post = await prisma.communityPost.findUnique({
      where: { id: params.id }
    })

    if (!post || post.userId !== user.id) {
      return NextResponse.json({ error: "Post not found or access denied" }, { status: 404 })
    }

    const body = await request.json()
    const { caption, tags, isPublished } = body

    const updated = await prisma.communityPost.update({
      where: { id: params.id },
      data: {
        ...(caption !== undefined && { caption, content: caption }),
        ...(tags !== undefined && { tags }),
        ...(isPublished !== undefined && { isPublished })
      }
    })

    return NextResponse.json({ post: updated })
  } catch (error) {
    console.error("Error updating post:", error)
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 })
  }
}

// DELETE: Delete post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const post = await prisma.communityPost.findUnique({
      where: { id: params.id }
    })

    if (!post || post.userId !== user.id) {
      return NextResponse.json({ error: "Post not found or access denied" }, { status: 404 })
    }

    await prisma.communityPost.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting post:", error)
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 })
  }
}
