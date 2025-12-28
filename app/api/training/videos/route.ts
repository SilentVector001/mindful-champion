
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const skillLevel = searchParams.get('skillLevel')
    const topic = searchParams.get('topic')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build where clause
    const where: any = {}
    
    if (skillLevel && skillLevel !== 'all') {
      where.skillLevel = skillLevel.toUpperCase()
    }
    
    if (topic && topic !== 'all') {
      where.OR = [
        { primaryTopic: { contains: topic, mode: 'insensitive' } },
        { secondaryTopics: { array_contains: topic } }
      ]
    }
    
    if (search) {
      const searchWhere = {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { channel: { contains: search, mode: 'insensitive' } },
          { primaryTopic: { contains: search, mode: 'insensitive' } }
        ]
      }
      
      if (where.OR) {
        where.AND = [{ OR: where.OR }, searchWhere]
        delete where.OR
      } else {
        where.OR = searchWhere.OR
      }
    }

    // Get videos
    const videos = await prisma.trainingVideo.findMany({
      where,
      take: limit,
      orderBy: [
        { skillLevel: 'asc' },
        { primaryTopic: 'asc' },
        { title: 'asc' }
      ]
    })

    // Get user's video progress
    const userProgress = await prisma.userVideoProgress.findMany({
      where: { userId: session.user.id },
      select: {
        videoId: true,
        watched: true,
        rating: true,
        notes: true
      }
    })

    return NextResponse.json({
      videos,
      userProgress
    })
  } catch (error) {
    console.error("Error fetching training videos:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
