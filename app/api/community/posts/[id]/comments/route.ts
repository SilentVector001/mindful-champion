import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// GET: Fetch comments for a post with reactions
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

    const comments = await prisma.postComment.findMany({
      where: {
        postId: params.id,
        parentId: null
      },
      include: {
        user: {
          select: { 
            id: true, 
            name: true, 
            image: true,
            subscriptionTier: true
          }
        },
        reactions: true,
        replies: {
          include: {
            user: {
              select: { 
                id: true, 
                name: true, 
                image: true,
                subscriptionTier: true
              }
            },
            reactions: true
          },
          orderBy: { createdAt: "asc" }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    // Format reactions for each comment
    const formattedComments = comments.map(comment => {
      const reactionCounts = comment.reactions.reduce((acc, r) => {
        if (!acc[r.emoji]) {
          acc[r.emoji] = { emoji: r.emoji, count: 0, userReacted: false }
        }
        acc[r.emoji].count++
        if (user && r.userId === user.id) {
          acc[r.emoji].userReacted = true
        }
        return acc
      }, {} as Record<string, { emoji: string; count: number; userReacted: boolean }>)

      return {
        ...comment,
        reactions: Object.values(reactionCounts)
      }
    })

    return NextResponse.json({ comments: formattedComments })
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}

// POST: Add a comment
export async function POST(
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

    const body = await request.json()
    const { content, parentId } = body

    if (!content?.trim()) {
      return NextResponse.json({ error: "Content required" }, { status: 400 })
    }

    // Get the post to find the owner
    const post = await prisma.communityPost.findUnique({
      where: { id: params.id },
      include: { user: true }
    })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    const comment = await prisma.postComment.create({
      data: {
        content: content.trim(),
        postId: params.id,
        userId: user.id,
        parentId: parentId || null
      },
      include: {
        user: {
          select: { 
            id: true, 
            name: true, 
            image: true,
            subscriptionTier: true
          }
        }
      }
    })

    // Update comment count
    await prisma.communityPost.update({
      where: { id: params.id },
      data: { commentCount: { increment: 1 } }
    })

    // Send email notification to post owner (if not commenting on own post)
    if (post.userId !== user.id && post.user.email) {
      try {
        const { sendCommentNotificationEmail } = await import("@/lib/email/comment-notification")
        await sendCommentNotificationEmail({
          postOwnerId: post.userId,
          postOwnerEmail: post.user.email,
          postOwnerName: post.user.name || "Player",
          commenterName: user.name || "A player",
          commentContent: content.trim(),
          postId: params.id,
          postCaption: post.caption || post.title || "your video"
        })
      } catch (emailError) {
        console.error("Failed to send comment notification email:", emailError)
        // Don't fail the comment creation if email fails
      }
    }

    return NextResponse.json({ comment, reactions: [] }, { status: 201 })
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
  }
}
