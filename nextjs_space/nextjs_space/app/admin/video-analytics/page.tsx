
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import VideoAnalyticsAdmin from '@/components/admin/video-analytics-admin'

export default async function AdminVideoAnalyticsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    redirect('/dashboard')
  }

  // Fetch video analytics stats
  const [
    totalVideos,
    totalAnalyzed,
    pendingAnalyses,
    failedAnalyses,
    storageUsed,
    recentVideos,
    userStats,
    avgProcessingTime
  ] = await Promise.all([
    // Total videos uploaded
    prisma.videoAnalysis.count(),
    
    // Successfully analyzed videos
    prisma.videoAnalysis.count({
      where: { analysisStatus: 'COMPLETED' }
    }),
    
    // Pending analyses
    prisma.videoAnalysis.count({
      where: { analysisStatus: { in: ['PENDING', 'PROCESSING'] } }
    }),
    
    // Failed analyses
    prisma.videoAnalysis.count({
      where: { analysisStatus: 'FAILED' }
    }),
    
    // Total storage used (in bytes)
    prisma.videoAnalysis.aggregate({
      _sum: { fileSize: true }
    }),
    
    // Recent 10 videos
    prisma.videoAnalysis.findMany({
      take: 10,
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
    }),
    
    // User video stats
    prisma.videoAnalysis.groupBy({
      by: ['userId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    }),
    
    // Average processing time (for completed videos)
    prisma.videoAnalysis.findMany({
      where: {
        analysisStatus: 'COMPLETED',
        analyzedAt: { not: null }
      },
      select: {
        uploadedAt: true,
        analyzedAt: true
      },
      take: 100,
      orderBy: { analyzedAt: 'desc' }
    })
  ])

  // Calculate average processing time
  const processingTimes = avgProcessingTime
    .filter((v: any) => v.analyzedAt)
    .map((v: any) => {
      const diff = new Date(v.analyzedAt!).getTime() - new Date(v.uploadedAt).getTime()
      return diff / 1000 / 60 // Convert to minutes
    })
  
  const avgTime = processingTimes.length > 0
    ? processingTimes.reduce((a: number, b: number) => a + b, 0) / processingTimes.length
    : 0

  // Get user details for top uploaders
  const topUploaderIds = userStats.map((s: any) => s.userId)
  const topUploaders = await prisma.user.findMany({
    where: { id: { in: topUploaderIds } },
    select: {
      id: true,
      name: true,
      email: true,
      subscriptionTier: true
    }
  })

  const topUploadersWithCounts = userStats.map((stat: any) => {
    const user = topUploaders.find((u: any) => u.id === stat.userId)
    return {
      ...user,
      videoCount: stat._count.id
    }
  })

  const stats = {
    totalVideos,
    totalAnalyzed,
    pendingAnalyses,
    failedAnalyses,
    storageUsedMB: Math.round((storageUsed._sum.fileSize || 0) / 1024 / 1024),
    avgProcessingTimeMinutes: Math.round(avgTime * 10) / 10,
    recentVideos: recentVideos.map((v: any) => ({
      ...v,
      uploadedAt: v.uploadedAt.toISOString(),
      analyzedAt: v.analyzedAt?.toISOString() || null
    })),
    topUploaders: topUploadersWithCounts
  }

  return <VideoAnalyticsAdmin initialStats={stats} />
}
