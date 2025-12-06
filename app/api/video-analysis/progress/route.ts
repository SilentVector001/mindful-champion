export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// POST: Update progress
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { videoId, progress } = body;

    if (!videoId || !progress) {
      return NextResponse.json(
        { error: 'Video ID and progress data are required' },
        { status: 400 }
      );
    }

    // Update progress in database
    await prisma.videoAnalysis.update({
      where: { id: videoId },
      data: {
        shotDetectionProgress: progress as any,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Progress update error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update progress' },
      { status: 500 }
    );
  }
}

// GET: Query progress
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    // Get video analysis with progress
    const video = await prisma.videoAnalysis.findUnique({
      where: { id: videoId },
      select: {
        shotDetectionProgress: true,
        analysisStatus: true,
      },
    });

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      progress: video.shotDetectionProgress || null,
      status: video.analysisStatus,
    });
  } catch (error: any) {
    console.error('Progress fetch error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}
