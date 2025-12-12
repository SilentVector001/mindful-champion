import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * POST /api/video-analysis/upload-handler
 * 
 * Handler for Vercel Blob client-side uploads.
 * This endpoint handles the token generation for direct client uploads,
 * bypassing the 4.5MB serverless function body size limit.
 * 
 * Supports files up to 500MB via direct upload to Blob storage.
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('[Upload Handler] === Client upload request started ===');

  // Check for BLOB_READ_WRITE_TOKEN first
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('[Upload Handler] ❌ BLOB_READ_WRITE_TOKEN not configured');
    return NextResponse.json(
      { 
        error: 'Video storage not configured. Please contact support.',
        details: 'BLOB_READ_WRITE_TOKEN missing'
      },
      { status: 503 }
    );
  }

  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.log('[Upload Handler] ❌ Unauthorized - no session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, subscriptionTier: true }
    });

    if (!user) {
      console.log('[Upload Handler] ❌ User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('[Upload Handler] User authenticated:', { userId: user.id, tier: user.subscriptionTier });

    const body = await request.json() as HandleUploadBody;

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Validate the upload before generating token
        console.log('[Upload Handler] Generating token for:', pathname);
        
        // Parse client payload for metadata
        const metadata = clientPayload ? JSON.parse(clientPayload) : {};
        
        return {
          allowedContentTypes: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'],
          maximumSizeInBytes: 500 * 1024 * 1024, // 500MB max
          tokenPayload: JSON.stringify({
            userId: user.id,
            fileName: metadata.fileName || pathname,
            timestamp: Date.now()
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Called after the client upload completes
        console.log('[Upload Handler] ✅ Upload completed:', blob.url);
        
        try {
          const payload = tokenPayload ? JSON.parse(tokenPayload) : {};
          const userId = payload.userId;
          const originalFileName = payload.fileName || blob.pathname;
          
          if (!userId) {
            console.error('[Upload Handler] ❌ No userId in token payload');
            return;
          }

          // Create video analysis record in database
          const videoAnalysis = await prisma.videoAnalysis.create({
            data: {
              userId,
              videoUrl: blob.url,
              title: originalFileName.replace(/\.[^/.]+$/, ''), // Remove extension
              description: '',
              fileName: originalFileName,
              fileSize: blob.size,
              duration: 0,
              analysisStatus: 'PENDING',
              cloud_storage_path: blob.url,
              isPublic: false
            }
          });

          console.log('[Upload Handler] ✅ Video record created:', videoAnalysis.id);
          
          // Note: We can't return data here as this is a webhook callback
          // The client will need to poll or use the blob URL to find the record
        } catch (dbError) {
          console.error('[Upload Handler] ❌ Database error:', dbError);
          // Don't throw - the upload succeeded, database record can be created later
        }
      },
    });

    const duration = Date.now() - startTime;
    console.log(`[Upload Handler] === Request completed in ${duration}ms ===`);

    return NextResponse.json(jsonResponse);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[Upload Handler] ❌ Error after ${duration}ms:`, error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload handler failed' },
      { status: 500 }
    );
  }
}
