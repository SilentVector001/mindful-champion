import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export async function GET(request: NextRequest) {
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

    const bookmarks = await prisma.postBookmark.findMany({
      where: { userId: user.id },
      include: {
        post: {
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
                overallScore: true
              }
            },
            _count: {
              select: { comments: true, likes: true }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    const posts = bookmarks
      .filter(b => b.post.isVideoPost)
      .map(b => ({
        ...b.post,
        isLiked: false,
        isSaved: true,
        likeCount: b.post._count.likes,
        commentCount: b.post._count.comments
      }))

    return NextResponse.json({ posts })
  } catch (error) {
    console.error("Error fetching saved posts:", error)
    return NextResponse.json({ error: "Failed to fetch saved posts" }, { status: 500 })
  }
}
