export const dynamic = "force-dynamic";
export const maxDuration = 120; // Increased to 2 minutes for larger files

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
  console.log("[Upload Proxy] === Starting upload request ===");
  const startTime = Date.now();
  
  try {
    // Check if Blob token is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("[Upload Proxy] ❌ BLOB_READ_WRITE_TOKEN not configured!");
      return NextResponse.json(
        { error: "Storage not configured. Please contact support.", details: "Missing BLOB_READ_WRITE_TOKEN" },
        { status: 500 }
      );
    }
    
    const session = await getServerSession(authOptions);
    console.log("[Upload Proxy] Session check:", { hasSession: !!session, email: session?.user?.email });
    
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
    
    console.log("[Upload Proxy] User found:", { userId: user.id, tier: user.subscriptionTier });

    // Parse form data
    console.log("[Upload Proxy] Parsing form data...");
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

    const totalTime = Date.now() - startTime;
    console.log("[Upload Proxy] ✅ Video record created:", videoAnalysis.id);
    console.log("[Upload Proxy] === Upload complete in", totalTime, "ms ===");

    return NextResponse.json({
      success: true,
      videoId: videoAnalysis.id,
      key: cloudStoragePath, // Frontend expects 'key'
      url: cloudStoragePath, // Frontend expects 'url'
      cloudStoragePath,
      uploadTime: totalTime,
      totalTime: totalTime,
      message: "Video uploaded successfully"
    });
  } catch (error) {
    const errorTime = Date.now() - startTime;
    console.error("[Upload Proxy] ❌ Error after", errorTime, "ms:", error);
    
    // Provide specific error messages
    let errorMessage = "Failed to upload video";
    let errorDetails = "Unknown error";
    
    if (error instanceof Error) {
      errorDetails = error.message;
      
      if (error.message.includes("token") || error.message.includes("BLOB")) {
        errorMessage = "Storage configuration error";
      } else if (error.message.includes("limit") || error.message.includes("quota")) {
        errorMessage = "Storage limit exceeded";
      } else if (error.message.includes("size")) {
        errorMessage = "File too large";
      } else if (error.message.includes("timeout")) {
        errorMessage = "Upload timed out";
      }
    }
    
    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails
      },
      { status: 500 }
    );
  }
}
