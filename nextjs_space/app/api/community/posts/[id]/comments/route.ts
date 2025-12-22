import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

// GET: Fetch comments for a post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const comments = await prisma.postComment.findMany({
      where: {
        postId: params.id,
        parentId: null
      },
      include: {
        user: {
          select: { id: true, name: true, image: true }
        },
        replies: {
          include: {
            user: {
              select: { id: true, name: true, image: true }
            }
          },
          orderBy: { createdAt: "asc" }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ comments })
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

    const comment = await prisma.postComment.create({
      data: {
        content: content.trim(),
        postId: params.id,
        userId: user.id,
        parentId: parentId || null
      },
      include: {
        user: {
          select: { id: true, name: true, image: true }
        }
      }
    })

    // Update comment count
    await prisma.communityPost.update({
      where: { id: params.id },
      data: { commentCount: { increment: 1 } }
    })

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
  }
}
