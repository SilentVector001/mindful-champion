
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { subDays, startOfDay } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const timeRange = searchParams.get('timeRange') || '30';

    // Calculate date range
    const daysAgo = timeRange === 'all' ? 365 : parseInt(timeRange);
    const startDate = subDays(startOfDay(new Date()), daysAgo);

    // Build base query filter
    const whereClause: any = {
      uploadedAt: {
        gte: timeRange === 'all' ? undefined : startDate
      }
    };

    if (userId) {
      whereClause.userId = userId;
    }

    // Fetch video data
    const [
      totalVideos,
      videos,
      statusCounts,
      flaggedCount,
      videosWithNotes,
      securityEvents
    ] = await Promise.all([
      // Total videos count
      prisma.videoAnalysis.count({ where: whereClause }),

      // All videos for detailed analysis
      prisma.videoAnalysis.findMany({
        where: whereClause,
        select: {
          id: true,
          title: true,
          uploadedAt: true,
          analysisStatus: true,
          overallScore: true,
          fileSize: true,
          adminNotes: true,
          flaggedForReview: true
        },
        orderBy: { uploadedAt: 'desc' }
      }),

      // Status breakdown
      prisma.videoAnalysis.groupBy({
        by: ['analysisStatus'],
        where: whereClause,
        _count: true
      }),

      // Flagged videos count
      prisma.videoAnalysis.count({
        where: {
          ...whereClause,
          flaggedForReview: true
        }
      }),

      // Videos with admin notes
      prisma.videoAnalysis.count({
        where: {
          ...whereClause,
          adminNotes: { not: null }
        }
      }),

      // Security events count
      prisma.securityLog.count({
        where: {
          ...(userId ? { userId } : {}),
          eventType: {
            in: [
              'ADMIN_VIDEO_UPLOADED',
              'ADMIN_VIDEO_FLAGGED',
              'ADMIN_VIDEO_DELETED',
              'ADMIN_VIDEO_REVIEWED',
              'ADMIN_VIDEO_NOTES_UPDATED'
            ]
          },
          timestamp: {
            gte: timeRange === 'all' ? undefined : startDate
          }
        }
      })
    ]);

    // Calculate status breakdown
    const statusBreakdown: Record<string, number> = {
      PENDING: 0,
      PROCESSING: 0,
      COMPLETED: 0,
      FAILED: 0
    };

    statusCounts.forEach((item) => {
      statusBreakdown[item.analysisStatus] = item._count;
    });

    // Calculate completed, pending, failed
    const completedAnalysis = statusBreakdown.COMPLETED || 0;
    const pendingAnalysis = statusBreakdown.PENDING + statusBreakdown.PROCESSING;
    const failedAnalysis = statusBreakdown.FAILED || 0;

    // Calculate total storage and average file size
    const totalStorageUsed = videos.reduce((sum, v) => sum + (v.fileSize || 0), 0);
    const avgFileSize = totalVideos > 0 ? totalStorageUsed / totalVideos : 0;

    // Calculate average score (only from completed videos with scores)
    const videosWithScores = videos.filter(v => v.overallScore && v.overallScore > 0);
    const averageScore = videosWithScores.length > 0
      ? videosWithScores.reduce((sum, v) => sum + (v.overallScore || 0), 0) / videosWithScores.length
      : 0;

    // Generate upload trend (daily counts for the time range)
    const uploadTrend: { date: string; count: number }[] = [];
    for (let i = Math.min(daysAgo, 30); i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = date.toISOString().split('T')[0];
      const count = videos.filter(v => {
        const uploadDate = new Date(v.uploadedAt).toISOString().split('T')[0];
        return uploadDate === dateStr;
      }).length;
      uploadTrend.push({ date: dateStr, count });
    }

    // Get recent videos
    const recentVideos = videos.slice(0, 10).map(v => ({
      id: v.id,
      title: v.title || 'Untitled Video',
      uploadedAt: v.uploadedAt.toISOString(),
      analysisStatus: v.analysisStatus,
      overallScore: v.overallScore || 0
    }));

    // Mock common issues (in a real scenario, this would come from analysis data)
    const mostCommonIssues = [
      { issue: 'Poor video quality', count: Math.floor(totalVideos * 0.15) },
      { issue: 'Incomplete analysis', count: failedAnalysis },
      { issue: 'Long processing time', count: Math.floor(totalVideos * 0.08) },
      { issue: 'Low technique scores', count: Math.floor(totalVideos * 0.12) }
    ].filter(issue => issue.count > 0);

    // Calculate average analysis time (mock for now)
    const averageAnalysisTime = 120; // 2 minutes average

    const response = {
      totalVideos,
      completedAnalysis,
      pendingAnalysis,
      failedAnalysis,
      totalStorageUsed,
      averageAnalysisTime,
      averageScore: Math.round(averageScore * 10) / 10,
      uploadTrend,
      statusBreakdown,
      recentVideos,
      flaggedVideos: flaggedCount,
      adminNotes: videosWithNotes,
      securityEvents,
      avgFileSize,
      mostCommonIssues
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching video analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
