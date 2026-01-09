import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// GET: Fetch community video posts with pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const tag = searchParams.get("tag")
    const userId = searchParams.get("userId")
    const skip = (page - 1) * limit

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const where: any = {
      isVideoPost: true,
      isPublished: true
    }

    if (tag) {
      where.tags = { has: tag }
    }

    if (userId) {
      where.userId = userId
    }

    const [posts, total] = await Promise.all([
      prisma.communityPost.findMany({
        where,
        include: {
          user: {
            select: { 
              id: true, 
              name: true, 
              image: true, 
              skillLevel: true,
              subscriptionTier: true,
              playerRating: true
            }
          },
          videoAnalysis: {
            select: {
              id: true,
              videoUrl: true,
              thumbnailUrl: true,
              title: true,
              duration: true,
              overallScore: true,
              analysisStatus: true
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
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.communityPost.count({ where })
    ])

    // Transform to add isLiked and isSaved flags
    const transformedPosts = posts.map(post => ({
      ...post,
      isLiked: post.likes.length > 0,
      isSaved: post.bookmarks.length > 0,
      likeCount: post._count.likes,
      commentCount: post._count.comments,
      likes: undefined,
      bookmarks: undefined,
      _count: undefined
    }))

    return NextResponse.json({
      posts: transformedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching community posts:", error)
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
  }
}

// POST: Create a new community video post
export async function POST(request: NextRequest) {
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
    const { videoAnalysisId, caption, tags } = body

    if (!videoAnalysisId) {
      return NextResponse.json({ error: "Video analysis ID required" }, { status: 400 })
    }

    // Verify user owns the video analysis
    const videoAnalysis = await prisma.VideoAnalysis.findUnique({
      where: { id: videoAnalysisId }
    })

    if (!videoAnalysis || videoAnalysis.userId !== user.id) {
      return NextResponse.json({ error: "Video not found or access denied" }, { status: 404 })
    }

    // Check if already shared
    const existing = await prisma.communityPost.findUnique({
      where: { videoAnalysisId }
    })

    if (existing) {
      return NextResponse.json({ error: "Video already shared" }, { status: 400 })
    }

    const post = await prisma.communityPost.create({
      data: {
        title: videoAnalysis.title || "Training Video",
        content: caption || "",
        caption,
        tags: tags || [],
        isVideoPost: true,
        isPublished: true,
        videoAnalysisId,
        userId: user.id,
        category: "TRAINING_TIPS"
      },
      include: {
        user: {
          select: { 
            id: true, 
            name: true, 
            image: true, 
            skillLevel: true,
            subscriptionTier: true,
            playerRating: true
          }
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
        }
      }
    })

    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    console.error("Error creating community post:", error)
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
  }
}
