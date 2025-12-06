
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { VideoInteractionType } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { 
      sessionId, 
      videoId, 
      videoTitle,
      interactionType, 
      currentTime, 
      watchPercentage,
      totalDuration,
      videoUrl 
    } = body;

    // Validate interaction type
    if (!Object.values(VideoInteractionType).includes(interactionType)) {
      return NextResponse.json({ error: 'Invalid interaction type' }, { status: 400 });
    }

    const videoInteraction = await prisma.videoInteraction.create({
      data: {
        userId: user.id,
        sessionId,
        videoId,
        videoTitle,
        interactionType,
        currentTime: currentTime ? parseFloat(currentTime) : null,
        watchPercentage: watchPercentage ? parseFloat(watchPercentage) : null,
        totalDuration: totalDuration ? parseFloat(totalDuration) : null,
        videoUrl,
      },
    });

    // If video is completed, update UserVideoProgress
    if (interactionType === 'COMPLETE') {
      await prisma.userVideoProgress.upsert({
        where: {
          userId_videoId: {
            userId: user.id,
            videoId,
          },
        },
        update: {
          watched: true,
          watchDate: new Date(),
        },
        create: {
          userId: user.id,
          videoId,
          watched: true,
          watchDate: new Date(),
        },
      });
    }

    return NextResponse.json({ 
      success: true,
      interactionId: videoInteraction.id 
    });
  } catch (error) {
    console.error('Video interaction tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track video interaction' },
      { status: 500 }
    );
  }
}
