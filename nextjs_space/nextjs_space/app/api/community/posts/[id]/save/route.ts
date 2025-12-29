import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

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

    const existingBookmark = await prisma.postBookmark.findUnique({
      where: {
        postId_userId: {
          postId: params.id,
          userId: user.id
        }
      }
    })

    if (existingBookmark) {
      await prisma.postBookmark.delete({
        where: { id: existingBookmark.id }
      })
      return NextResponse.json({ saved: false })
    } else {
      await prisma.postBookmark.create({
        data: {
          postId: params.id,
          userId: user.id
        }
      })
      return NextResponse.json({ saved: true })
    }
  } catch (error) {
    console.error("Error toggling save:", error)
    return NextResponse.json({ error: "Failed to toggle save" }, { status: 500 })
  }
}
