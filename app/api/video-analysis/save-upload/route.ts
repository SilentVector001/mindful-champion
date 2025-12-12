import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * POST /api/video-analysis/save-upload
 * 
 * Save video metadata after successful client-side direct upload.
 * Called by the client after upload completes to create the database record.
 */
export async function POST(request: NextRequest) {
  console.log('[Save Upload] === Processing save request ===');

  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { url, fileName, fileSize, contentType } = body;

    if (!url) {
      return NextResponse.json({ error: 'Missing blob URL' }, { status: 400 });
    }

    // Check if video record already exists (may have been created by onUploadCompleted callback)
    const existingVideo = await prisma.videoAnalysis.findFirst({
      where: {
        userId: user.id,
        videoUrl: url
      }
    });

    if (existingVideo) {
      console.log('[Save Upload] Video record already exists:', existingVideo.id);
      return NextResponse.json({
        success: true,
        videoId: existingVideo.id,
        url: existingVideo.videoUrl,
        message: 'Video record already exists'
      });
    }

    // Create video analysis record
    const videoAnalysis = await prisma.videoAnalysis.create({
      data: {
        userId: user.id,
        videoUrl: url,
        title: fileName?.replace(/\.[^/.]+$/, '') || 'Untitled Video',
        description: '',
        fileName: fileName || 'video.mp4',
        fileSize: fileSize || 0,
        duration: 0,
        analysisStatus: 'PENDING',
        cloud_storage_path: url,
        isPublic: false
      }
    });

    console.log('[Save Upload] ✅ Video record created:', videoAnalysis.id);

    return NextResponse.json({
      success: true,
      videoId: videoAnalysis.id,
      url: videoAnalysis.videoUrl,
      key: videoAnalysis.cloud_storage_path,
      message: 'Video saved successfully'
    });
  } catch (error) {
    console.error('[Save Upload] ❌ Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save video' },
      { status: 500 }
    );
  }
}
