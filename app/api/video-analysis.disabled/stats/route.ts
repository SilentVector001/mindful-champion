
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = "force-dynamic";
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'

import { prisma } from '@/lib/db'


export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const videos = await prisma.videoAnalysis.findMany({
      where: { userId: session.user.id! },
      select: {
        id: true,
        fileSize: true,
        analysisStatus: true,
        overallScore: true,
        uploadedAt: true,
        analyzedAt: true
      }
    })

    const totalVideos = videos.length
    const totalAnalyzed = videos.filter(v => v.analysisStatus === 'COMPLETED').length
    const storageUsed = videos.reduce((sum, v) => sum + v.fileSize, 0) / (1024 * 1024) // MB
    const storageLimit = 5000 // 5GB in MB

    // Calculate recent activity (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentlyAnalyzed = videos.filter(
      v => v.analyzedAt && new Date(v.analyzedAt) > thirtyDaysAgo
    ).length

    // Calculate average improvement (simulated for now)
    const scoresWithProgress = videos.filter(v => v.overallScore).map(v => v.overallScore!)
    const avgScore = scoresWithProgress.length > 0
      ? scoresWithProgress.reduce((sum, score) => sum + score, 0) / scoresWithProgress.length
      : 0
    const baselineScore = 70
    const avgImprovement = Math.max(0, Math.round(avgScore - baselineScore))

    return NextResponse.json({
      success: true,
      stats: {
        totalVideos,
        totalAnalyzed,
        storageUsed: Math.round(storageUsed),
        storageLimit,
        recentlyAnalyzed,
        avgImprovement
      }
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
