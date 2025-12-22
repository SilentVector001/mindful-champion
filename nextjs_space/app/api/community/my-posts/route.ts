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

    const posts = await prisma.communityPost.findMany({
      where: {
        userId: user.id,
        isVideoPost: true
      },
      include: {
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
      },
      orderBy: { createdAt: "desc" }
    })

    const transformedPosts = posts.map(post => ({
      ...post,
      likeCount: post._count.likes,
      commentCount: post._count.comments,
      isOwner: true
    }))

    return NextResponse.json({ posts: transformedPosts })
  } catch (error) {
    console.error("Error fetching my posts:", error)
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
  }
}
