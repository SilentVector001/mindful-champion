// @ts-nocheck
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getFileUrl } from "@/lib/blob";

/**
 * GET /api/video-analysis/[videoId]/signed-url
 * Get a signed URL for the video file
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { videoId: string } }
) {
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
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const { videoId } = params;

    // Get video analysis
    const videoAnalysis = await prisma.VideoAnalysis.findUnique({
      where: { id: videoId },
      select: {
        id: true,
        userId: true,
        cloud_storage_path: true,
        videoUrl: true,
        fileName: true
      }
    });

    if (!videoAnalysis) {
      return NextResponse.json(
        { error: "Video not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (videoAnalysis.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // If video has cloud storage path, generate signed URL
    if (videoAnalysis.cloud_storage_path) {
      try {
        const videoUrl = await getFileUrl(videoAnalysis.cloud_storage_path, false);
        
        return NextResponse.json({
          success: true,
          videoUrl,
          expiresIn: 3600 // 1 hour
        });
      } catch (error) {
        console.error("[Signed URL] Failed to generate URL:", error);
        return NextResponse.json(
          { 
            error: "Failed to generate video URL",
            needsReupload: true,
            message: "Video file may have been deleted. Please re-upload this video."
          },
          { status: 410 }
        );
      }
    }

    // Fallback to videoUrl if no cloud_storage_path
    if (videoAnalysis.videoUrl) {
      return NextResponse.json({
        success: true,
        videoUrl: videoAnalysis.videoUrl,
        expiresIn: null
      });
    }

    // No video URL available
    return NextResponse.json(
      { 
        error: "Video file not available",
        needsReupload: true,
        message: "Video file not found. Please re-upload this video."
      },
      { status: 410 }
    );

  } catch (error) {
    console.error("[Signed URL] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to get video URL",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
