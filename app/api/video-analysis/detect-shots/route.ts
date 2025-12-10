export const dynamic = "force-dynamic";
export const maxDuration = 300;

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
// TEMPORARY: Heavy ML imports disabled to reduce serverless function size
// import { LLMShotDetector } from '@/lib/video-analysis/llm-shot-detector';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { videoId, videoUrl } = body;

    if (!videoId || !videoUrl) {
      return NextResponse.json(
        { error: 'Video ID and URL are required' },
        { status: 400 }
      );
    }

    console.log('🎯 Starting shot detection (MOCK MODE)...');
    console.log('   Video ID:', videoId);
    console.log('   Video URL:', videoUrl);

    // Verify video exists
    const video = await prisma.videoAnalysis.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    // Update status to PROCESSING
    await prisma.videoAnalysis.update({
      where: { id: videoId },
      data: {
        analysisStatus: 'PROCESSING',
        shotDetectionProgress: {
          stage: 'detecting',
          message: 'Shot detection in progress...',
        } as any,
      },
    });

    // TEMPORARY: Return mock shot detection data
    const mockShots = [
      {
        timestamp: 0,
        type: 'serve',
        confidence: 0.85,
        description: 'Serve detected'
      },
      {
        timestamp: 2.5,
        type: 'return',
        confidence: 0.82,
        description: 'Return of serve'
      },
      {
        timestamp: 5.0,
        type: 'dink',
        confidence: 0.78,
        description: 'Dink shot'
      }
    ];

    // Update with mock results
    await prisma.videoAnalysis.update({
      where: { id: videoId },
      data: {
        analysisStatus: 'COMPLETED',
        detectedShots: mockShots,
        totalShots: mockShots.length,
        shotDetectionProgress: {
          stage: 'completed',
          message: 'Shot detection completed (mock mode)',
        } as any,
        analyzedAt: new Date(),
      },
    });

    console.log('✅ Shot detection completed (MOCK MODE)');

    return NextResponse.json({
      success: true,
      shots: mockShots,
      totalShots: mockShots.length,
      note: 'Full AI shot detection will be available soon'
    });

  } catch (error) {
    console.error('❌ Shot detection error:', error);
    
    return NextResponse.json(
      {
        error: 'Shot detection failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
