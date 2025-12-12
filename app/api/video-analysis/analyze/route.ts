export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getFileUrl } from "@/lib/blob";

/**
 * POST /api/video-analysis/analyze
 * Trigger analysis for an uploaded video
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
      select: { 
        id: true, 
        subscriptionTier: true,
        skillLevel: true,
        primaryGoals: true,
        biggestChallenges: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { videoId } = body;

    if (!videoId) {
      return NextResponse.json(
        { error: "videoId is required" },
        { status: 400 }
      );
    }

    // Get video analysis record
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

    // Update status to PROCESSING
    await prisma.videoAnalysis.update({
      where: { id: videoId },
      data: {
        analysisStatus: "PROCESSING"
      }
    });

    const userTier = user.subscriptionTier || "FREE";
    const isPremium = userTier === "PREMIUM";
    const isPro = userTier === "PRO";

    // Simulate analysis (in production, this would use actual AI/ML processing)
    const analysis: any = {
      strengths: [
        "Strong serve placement with excellent depth control",
        "Effective third shot drops to neutralize attacks",
        "Solid court positioning during rallies",
        "Consistent dinking game with controlled pace"
      ],
      areasForImprovement: [
        "Footwork in transition zone needs improvement",
        "Overhead smashes lack power and follow-through",
        "Backhand volleys tend to pop up under pressure",
        "Decision-making under pressure could be better"
      ],
      recommendations: [
        "Practice Third Shot Drop Mastery drill 3x per week",
        "Work on Transition Zone Footwork drill",
        "Add Power Serve Practice to training routine",
        "Focus on mental game with breathing exercises"
      ]
    };

    // Add premium features
    if (isPremium || isPro) {
      analysis.movementAnalysis = {
        speed: 7.2,
        efficiency: 6.8,
        positioning: 7.5,
        splitStepTiming: 6.5
      };
      
      analysis.technicalBreakdown = {
        footwork: 7.0,
        paddleAngle: 7.5,
        followThrough: 6.5,
        bodyRotation: 7.2,
        balanceControl: 7.8
      };
    }

    // Add PRO features
    if (isPro) {
      analysis.shotTypes = [
        { type: "Serve", count: 24, accuracy: 85 },
        { type: "Third Shot Drop", count: 18, accuracy: 72 },
        { type: "Dink", count: 45, accuracy: 88 },
        { type: "Volley", count: 32, accuracy: 78 },
        { type: "Overhead", count: 8, accuracy: 62 },
        { type: "Groundstroke", count: 28, accuracy: 81 }
      ];

      analysis.videoTimestamps = [
        { time: "2:34", event: "Excellent third shot drop", impact: "Led to point win" },
        { time: "5:12", event: "Missed overhead opportunity", impact: "Should have attacked" },
        { time: "8:45", event: "Great defensive dinking", impact: "Forced opponent error" },
        { time: "11:20", event: "Poor footwork on transition", impact: "Led to unforced error" },
        { time: "14:03", event: "Perfect serve placement", impact: "Ace" }
      ];

      analysis.detailedMetrics = {
        avgRallyLength: 6.8,
        unforcedErrors: 12,
        winners: 8,
        firstServePercentage: 82,
        kitchenTimePercentage: 68,
        attackSuccessRate: 71
      };
    }

    // Update video analysis with results
    const updatedVideo = await prisma.videoAnalysis.update({
      where: { id: videoId },
      data: {
        analysisStatus: "COMPLETED",
        analyzedAt: new Date(),
        overallScore: 75,
        strengths: analysis.strengths,
        areasForImprovement: analysis.areasForImprovement,
        recommendations: analysis.recommendations,
        shotTypes: analysis.shotTypes,
        totalShots: analysis.shotTypes ? analysis.shotTypes.reduce((sum: number, shot: any) => sum + shot.count, 0) : null,
        movementMetrics: analysis.movementAnalysis,
        technicalScores: analysis.technicalBreakdown,
        keyMoments: analysis.videoTimestamps,
        progressTracking: analysis.detailedMetrics
      }
    });

    console.log("[Analyze] Analysis completed:", {
      videoId,
      userId: user.id,
      tier: userTier
    });

    return NextResponse.json({
      success: true,
      videoId: updatedVideo.id,
      analysis: {
        ...analysis,
        tier: userTier,
        overallScore: 75
      },
      message: "Analysis completed successfully"
    });
  } catch (error) {
    console.error("[Analyze] Error:", error);
    
    // Update video status to FAILED if we have the videoId
    const body = await request.json().catch(() => ({}));
    if (body.videoId) {
      await prisma.videoAnalysis.update({
        where: { id: body.videoId },
        data: { analysisStatus: "FAILED" }
      }).catch(() => {});
    }

    return NextResponse.json(
      {
        error: "Failed to analyze video",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
