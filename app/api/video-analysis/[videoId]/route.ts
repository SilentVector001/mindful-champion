export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getFileUrl, deleteFile } from "@/lib/s3";

/**
 * GET /api/video-analysis/[videoId]
 * Get a specific video analysis
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
      select: { id: true, subscriptionTier: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const { videoId } = params;

    // Get video analysis
    const videoAnalysis = await prisma.videoAnalysis.findUnique({
      where: { id: videoId }
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

    // Generate signed URL for video if cloud_storage_path exists
    let videoUrl = null;
    if (videoAnalysis.cloud_storage_path) {
      try {
        videoUrl = await getFileUrl(videoAnalysis.cloud_storage_path, false);
      } catch (error) {
        console.error("[Get Video] Failed to generate URL:", error);
        // Continue without URL - non-blocking error
      }
    }

    console.log("[Get Video] Retrieved video:", {
      videoId,
      userId: user.id,
      status: videoAnalysis.analysisStatus
    });

    return NextResponse.json({
      success: true,
      video: {
        ...videoAnalysis,
        videoUrl
      }
    });
  } catch (error) {
    console.error("[Get Video] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to retrieve video",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/video-analysis/[videoId]
 * Delete a video analysis
 */
export async function DELETE(
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
    const videoAnalysis = await prisma.videoAnalysis.findUnique({
      where: { id: videoId }
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

    // Delete from S3 if cloud_storage_path exists
    if (videoAnalysis.cloud_storage_path) {
      try {
        await deleteFile(videoAnalysis.cloud_storage_path);
        console.log("[Delete Video] S3 file deleted:", videoAnalysis.cloud_storage_path);
      } catch (error) {
        console.error("[Delete Video] Failed to delete S3 file:", error);
        // Continue with database deletion even if S3 deletion fails
      }
    }

    // Delete from database
    await prisma.videoAnalysis.delete({
      where: { id: videoId }
    });

    console.log("[Delete Video] Video deleted:", {
      videoId,
      userId: user.id
    });

    return NextResponse.json({
      success: true,
      message: "Video deleted successfully"
    });
  } catch (error) {
    console.error("[Delete Video] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete video",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/video-analysis/[videoId]
 * Update video metadata (title, description)
 */
export async function PATCH(
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
    const videoAnalysis = await prisma.videoAnalysis.findUnique({
      where: { id: videoId }
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

    // Parse request body
    const body = await request.json();
    const { title, description } = body;

    // Update video metadata
    const updatedVideo = await prisma.videoAnalysis.update({
      where: { id: videoId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description })
      }
    });

    console.log("[Update Video] Video updated:", {
      videoId,
      userId: user.id
    });

    return NextResponse.json({
      success: true,
      video: updatedVideo,
      message: "Video updated successfully"
    });
  } catch (error) {
    console.error("[Update Video] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to update video",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
