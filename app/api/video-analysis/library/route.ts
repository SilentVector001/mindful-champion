export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getFileUrl } from "@/lib/s3";

/**
 * GET /api/video-analysis/library
 * Get all video analyses for the current user
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build where clause
    const where: any = { userId: user.id };
    if (status && ["PENDING", "PROCESSING", "COMPLETED", "FAILED"].includes(status)) {
      where.analysisStatus = status;
    }

    // Get videos
    const videos = await prisma.videoAnalysis.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { uploadedAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        fileName: true,
        fileSize: true,
        duration: true,
        uploadedAt: true,
        analyzedAt: true,
        analysisStatus: true,
        overallScore: true,
        cloud_storage_path: true,
        thumbnailUrl: true
      }
    });

    // Get total count
    const totalCount = await prisma.videoAnalysis.count({ where });

    console.log("[Library] Retrieved videos:", {
      userId: user.id,
      count: videos.length,
      totalCount
    });

    return NextResponse.json({
      success: true,
      videos,
      pagination: {
        limit,
        offset,
        totalCount,
        hasMore: offset + videos.length < totalCount
      }
    });
  } catch (error) {
    console.error("[Library] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to retrieve videos",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
