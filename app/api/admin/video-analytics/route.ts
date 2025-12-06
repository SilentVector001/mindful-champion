
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build filter
    const where: any = {}
    if (status && status !== 'all') {
      where.analysisStatus = status.toUpperCase()
    }
    if (userId) {
      where.userId = userId
    }

    // Fetch videos
    const videos = await prisma.videoAnalysis.findMany({
      where,
      take: limit,
      orderBy: { uploadedAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            subscriptionTier: true
          }
        }
      }
    })

    // Fetch updated stats
    const [totalVideos, totalAnalyzed, pendingAnalyses, failedAnalyses, storageUsed] = await Promise.all([
      prisma.videoAnalysis.count(),
      prisma.videoAnalysis.count({ where: { analysisStatus: 'COMPLETED' } }),
      prisma.videoAnalysis.count({ where: { analysisStatus: { in: ['PENDING', 'PROCESSING'] } } }),
      prisma.videoAnalysis.count({ where: { analysisStatus: 'FAILED' } }),
      prisma.videoAnalysis.aggregate({ _sum: { fileSize: true } })
    ])

    const stats = {
      totalVideos,
      totalAnalyzed,
      pendingAnalyses,
      failedAnalyses,
      storageUsedMB: Math.round((storageUsed._sum.fileSize || 0) / 1024 / 1024),
      avgProcessingTimeMinutes: 3.5 // Placeholder
    }

    return NextResponse.json({
      stats,
      videos: videos.map(v => ({
        ...v,
        uploadedAt: v.uploadedAt.toISOString(),
        analyzedAt: v.analyzedAt?.toISOString() || null
      }))
    })
  } catch (error) {
    console.error('Admin video analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch video analytics' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
