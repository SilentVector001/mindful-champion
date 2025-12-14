export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * POST /api/video-analysis/confirm-upload
 * Confirm that a video was uploaded to S3 and create a database record
 */
export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const { key, title, description, fileName, fileSize } = body;

    if (!key || !title || !fileName) {
      return NextResponse.json(
        { error: "key, title, and fileName are required" },
        { status: 400 }
      );
    }

    // Create video analysis record
    const videoAnalysis = await prisma.videoAnalysis.create({
      data: {
        userId: user.id,
        videoUrl: key,
        title,
        description: description || "",
        fileName,
        fileSize: fileSize || 0,
        duration: 0, // Will be updated after analysis
        analysisStatus: "PENDING",
        cloud_storage_path: key,
        isPublic: false
      }
    });

    console.log("[Confirm Upload] Video record created:", {
      videoId: videoAnalysis.id,
      key,
      userId: user.id
    });

    return NextResponse.json({
      success: true,
      videoId: videoAnalysis.id,
      cloudStoragePath: key,
      message: "Video upload confirmed"
    });
  } catch (error) {
    console.error("[Confirm Upload] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to confirm upload",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
