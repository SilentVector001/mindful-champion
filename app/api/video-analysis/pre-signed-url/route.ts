export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getBucketConfig, createS3Client } from "@/lib/aws-config";
import { prisma } from "@/lib/db";

/**
 * POST /api/video-analysis/pre-signed-url
 * Generate a pre-signed URL for direct client-side upload to S3
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
    const { fileName, fileType, fileSize } = body;

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: "fileName and fileType are required" },
        { status: 400 }
      );
    }

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (fileSize && fileSize > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 500MB limit" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"];
    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json(
        { error: "Invalid file type. Only video files are allowed." },
        { status: 400 }
      );
    }

    // Get S3 configuration
    const { bucketName, folderPrefix } = getBucketConfig();
    
    if (!bucketName) {
      throw new Error("AWS_BUCKET_NAME not configured");
    }

    // Generate unique S3 key
    const timestamp = Date.now();
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.]/g, "_");
    const key = `${folderPrefix}uploads/video_${timestamp}_${sanitizedName}`;

    // Create S3 client
    const s3Client = createS3Client();

    // Generate pre-signed URL
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: fileType
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600 // 1 hour
    });

    console.log("[Pre-signed URL] Generated:", {
      key,
      fileName,
      fileType,
      userId: user.id
    });

    return NextResponse.json({
      success: true,
      uploadUrl: signedUrl,
      key,
      expiresIn: 3600
    });
  } catch (error) {
    console.error("[Pre-signed URL] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate pre-signed URL",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
