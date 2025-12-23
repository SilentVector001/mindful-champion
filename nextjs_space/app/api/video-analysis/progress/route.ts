import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET - Fetch user's video analysis progress and history
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get all video analyses with shots
    const analyses = await prisma.videoAnalysis.findMany({
      where: { userId: user.id, analysisStatus: 'COMPLETED' },
      orderBy: { uploadedAt: 'desc' },
      select: {
        id: true,
        title: true,
        uploadedAt: true,
        overallScore: true,
        totalShots: true,
        technicalScores: true,
        thumbnailUrl: true
      },
      take: 20
    })

    // Get skill progress
    const skillProgress = await prisma.videoAnalysisProgress.findMany({
      where: { userId: user.id },
      orderBy: { averageScore: 'desc' }
    })

    // Get achievements
    const achievements = await prisma.videoAnalysisUserAchievement.findMany({
      where: { userId: user.id },
      include: { achievement: true },
      orderBy: { unlockedAt: 'desc' }
    })

    // Calculate overall stats
    const totalAnalyses = analyses?.length ?? 0
    const totalShots = analyses?.reduce((sum, a) => sum + (a?.totalShots ?? 0), 0) ?? 0
    const avgScore = totalAnalyses > 0 
      ? Math.round(analyses?.reduce((sum, a) => sum + (a?.overallScore ?? 0), 0) / totalAnalyses) 
      : 0
    
    // Calculate improvement
    let improvement = 0
    if (analyses && analyses.length >= 2) {
      const firstScore = analyses[analyses.length - 1]?.overallScore ?? 0
      const latestScore = analyses[0]?.overallScore ?? 0
      if (firstScore > 0) {
        improvement = Math.round(((latestScore - firstScore) / firstScore) * 100)
      }
    }

    // Build history timeline for charts (last 10 analyses)
    const historyData = (analyses?.slice(0, 10)?.reverse() ?? []).map((a, i) => ({
      date: new Date(a?.uploadedAt ?? Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: a?.overallScore ?? 0,
      session: i + 1
    }))

    return NextResponse.json({
      stats: {
        totalAnalyses,
        totalShots,
        avgScore,
        improvement
      },
      analyses: analyses ?? [],
      skillProgress: skillProgress ?? [],
      achievements: achievements ?? [],
      historyData: historyData ?? [],
      hasHistory: totalAnalyses > 1
    })
  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 })
  }
}
