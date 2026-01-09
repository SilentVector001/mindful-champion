export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * POST /api/video-analysis/[videoId]/save-shots
 * Save detected shots to the database
 */
export async function POST(
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
    const { detectedShots } = body;

    if (!detectedShots || !Array.isArray(detectedShots)) {
      return NextResponse.json(
        { error: "Invalid detected shots data" },
        { status: 400 }
      );
    }

    // Update video analysis with detected shots
    const updatedVideo = await prisma.VideoAnalysis.update({
      where: { id: videoId },
      data: {
        detectedShots: detectedShots
      }
    });

    console.log("[Save Shots] Shots saved:", {
      videoId,
      userId: user.id,
      shotsCount: detectedShots.length
    });

    return NextResponse.json({
      success: true,
      video: updatedVideo,
      message: "Detected shots saved successfully"
    });
  } catch (error) {
    console.error("[Save Shots] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to save detected shots",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
