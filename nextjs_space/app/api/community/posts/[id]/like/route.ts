import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

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

    const existingLike = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId: params.id,
          userId: user.id
        }
      }
    })

    if (existingLike) {
      // Unlike
      await prisma.postLike.delete({
        where: { id: existingLike.id }
      })
      await prisma.communityPost.update({
        where: { id: params.id },
        data: { likeCount: { decrement: 1 } }
      })
      return NextResponse.json({ liked: false })
    } else {
      // Like
      await prisma.postLike.create({
        data: {
          postId: params.id,
          userId: user.id
        }
      })
      await prisma.communityPost.update({
        where: { id: params.id },
        data: { likeCount: { increment: 1 } }
      })
      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error("Error toggling like:", error)
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 })
  }
}
