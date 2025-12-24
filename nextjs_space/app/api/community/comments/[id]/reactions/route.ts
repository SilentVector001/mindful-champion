import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// POST: Toggle reaction on a comment
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
    const { emoji } = body

    const allowedEmojis = ["🆒", "❤️", "👏", "🔥", "😂"]
    if (!emoji || !allowedEmojis.includes(emoji)) {
      return NextResponse.json({ error: "Invalid emoji" }, { status: 400 })
    }

    // Check if reaction exists
    const existingReaction = await prisma.commentReaction.findUnique({
      where: {
        commentId_userId_emoji: {
          commentId: params.id,
          userId: user.id,
          emoji
        }
      }
    })

    if (existingReaction) {
      // Remove reaction
      await prisma.commentReaction.delete({
        where: { id: existingReaction.id }
      })
      return NextResponse.json({ success: true, action: "removed" })
    } else {
      // Add reaction
      await prisma.commentReaction.create({
        data: {
          commentId: params.id,
          userId: user.id,
          emoji
        }
      })
      return NextResponse.json({ success: true, action: "added" })
    }
  } catch (error) {
    console.error("Error toggling reaction:", error)
    return NextResponse.json({ error: "Failed to toggle reaction" }, { status: 500 })
  }
}

// GET: Get reactions for a comment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.email 
      ? (await prisma.user.findUnique({ where: { email: session.user.email } }))?.id 
      : null

    const reactions = await prisma.commentReaction.groupBy({
      by: ['emoji'],
      where: { commentId: params.id },
      _count: { emoji: true }
    })

    // Check which reactions the current user has made
    const userReactions = userId 
      ? await prisma.commentReaction.findMany({
          where: { commentId: params.id, userId },
          select: { emoji: true }
        })
      : []

    const userEmojiSet = new Set(userReactions.map(r => r.emoji))

    const formattedReactions = reactions.map(r => ({
      emoji: r.emoji,
      count: r._count.emoji,
      userReacted: userEmojiSet.has(r.emoji)
    }))

    return NextResponse.json({ reactions: formattedReactions })
  } catch (error) {
    console.error("Error fetching reactions:", error)
    return NextResponse.json({ error: "Failed to fetch reactions" }, { status: 500 })
  }
}
