export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * GET /api/video-analysis/stats
 * Get video analysis statistics for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, subscriptionTier: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get statistics
    const [totalVideos, completedVideos, pendingVideos, processingVideos, failedVideos] = await Promise.all([
      prisma.videoAnalysis.count({
        where: { userId: user.id }
      }),
      prisma.videoAnalysis.count({
        where: { userId: user.id, analysisStatus: "COMPLETED" }
      }),
      prisma.videoAnalysis.count({
        where: { userId: user.id, analysisStatus: "PENDING" }
      }),
      prisma.videoAnalysis.count({
        where: { userId: user.id, analysisStatus: "PROCESSING" }
      }),
      prisma.videoAnalysis.count({
        where: { userId: user.id, analysisStatus: "FAILED" }
      })
    ]);

    // Get average score for completed videos
    const completedVideosWithScores = await prisma.videoAnalysis.findMany({
      where: {
        userId: user.id,
        analysisStatus: "COMPLETED",
        overallScore: { not: null }
      },
      select: { overallScore: true }
    });

    const averageScore = completedVideosWithScores.length > 0
      ? completedVideosWithScores.reduce((sum, v) => sum + (v.overallScore || 0), 0) / completedVideosWithScores.length
      : null;

    // Calculate storage used (sum of file sizes in MB)
    const storageResult = await prisma.videoAnalysis.aggregate({
      where: { userId: user.id },
      _sum: { fileSize: true }
    });
    const storageUsedMB = Math.round((storageResult._sum.fileSize || 0) / (1024 * 1024));

    // Calculate average improvement (compare earliest vs latest scores)
    let avgImprovement = 0;
    if (completedVideosWithScores.length >= 2) {
      const sortedVideos = await prisma.videoAnalysis.findMany({
        where: { userId: user.id, analysisStatus: "COMPLETED", overallScore: { not: null } },
        orderBy: { uploadedAt: "asc" },
        select: { overallScore: true }
      });
      if (sortedVideos.length >= 2) {
        const firstScore = sortedVideos[0].overallScore || 0;
        const lastScore = sortedVideos[sortedVideos.length - 1].overallScore || 0;
        avgImprovement = firstScore > 0 ? Math.round(((lastScore - firstScore) / firstScore) * 100) : 0;
      }
    }

    // Get recent videos
    const recentVideos = await prisma.videoAnalysis.findMany({
      where: { userId: user.id },
      take: 5,
      orderBy: { uploadedAt: "desc" },
      select: {
        id: true,
        title: true,
        uploadedAt: true,
        analysisStatus: true,
        overallScore: true
      }
    });

    const stats = {
      totalVideos,
      totalAnalyzed: completedVideos,
      completedVideos,
      pendingVideos,
      processingVideos,
      failedVideos,
      averageScore: averageScore ? Math.round(averageScore) : null,
      storageUsed: storageUsedMB, // in MB
      storageLimit: 5000, // 5GB in MB
      recentlyAnalyzed: completedVideos,
      avgImprovement,
      recentVideos
    };

    console.log("[Stats] Retrieved statistics:", {
      userId: user.id,
      totalVideos
    });

    return NextResponse.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error("[Stats] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to retrieve statistics",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
