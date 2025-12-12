export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadFile } from "@/lib/blob";
import { prisma } from "@/lib/db";

/**
 * POST /api/video-analysis/upload-proxy
 * Upload video file directly through the server (proxy method)
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

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const originalFileName = formData.get("fileName") as string;
    const title = originalFileName || file.name; // Use fileName from form or file.name as fallback
    const description = formData.get("description") as string || "";

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 500MB limit" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only video files are allowed." },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique filename for Blob storage
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const fileName = `video_${timestamp}_${sanitizedName}`;

    // Upload to Vercel Blob
    console.log("[Upload Proxy] Uploading to Vercel Blob:", {
      fileName,
      fileSize: file.size,
      contentType: file.type
    });

    const cloudStoragePath = await uploadFile(
      buffer,
      fileName,
      false, // Not public
      file.type
    );

    console.log("[Upload Proxy] Upload successful:", cloudStoragePath);

    // Create video analysis record
    const videoAnalysis = await prisma.videoAnalysis.create({
      data: {
        userId: user.id,
        videoUrl: cloudStoragePath,
        title,
        description,
        fileName: file.name,
        fileSize: file.size,
        duration: 0, // Will be updated after analysis
        analysisStatus: "PENDING",
        cloud_storage_path: cloudStoragePath,
        isPublic: false
      }
    });

    console.log("[Upload Proxy] Video record created:", videoAnalysis.id);

    return NextResponse.json({
      success: true,
      videoId: videoAnalysis.id,
      key: cloudStoragePath, // Frontend expects 'key'
      url: cloudStoragePath, // Frontend expects 'url'
      cloudStoragePath,
      uploadTime: 0, // Placeholder for compatibility
      totalTime: 0, // Placeholder for compatibility
      message: "Video uploaded successfully"
    });
  } catch (error) {
    console.error("[Upload Proxy] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to upload video",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
