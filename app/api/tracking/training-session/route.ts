
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

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
      sessionType,
      activities,
      totalDuration,
      videosWatched,
      drillsCompleted,
      programDayCompleted,
      programId,
      satisfactionRating,
      notes
    } = body;

    const trainingSession = await prisma.trainingSessionActivity.create({
      data: {
        userId: user.id,
        sessionType,
        skillLevel: user.skillLevel,
        activities: activities || [],
        totalDuration,
        videosWatched: videosWatched || 0,
        drillsCompleted: drillsCompleted || 0,
        programDayCompleted,
        programId,
        satisfactionRating,
        notes,
      },
    });

    return NextResponse.json({ 
      success: true,
      trainingSessionId: trainingSession.id 
    });
  } catch (error) {
    console.error('Training session tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track training session' },
      { status: 500 }
    );
  }
}
