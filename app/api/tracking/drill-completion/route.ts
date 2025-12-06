
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { DrillStatus } from '@prisma/client';

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
      drillId,
      drillName,
      drillCategory,
      status,
      endTime,
      timeSpent,
      performanceScore,
      repetitions,
      notes
    } = body;

    // Validate drill status
    if (!Object.values(DrillStatus).includes(status)) {
      return NextResponse.json({ error: 'Invalid drill status' }, { status: 400 });
    }

    const drillCompletion = await prisma.drillCompletion.create({
      data: {
        userId: user.id,
        sessionId,
        drillId,
        drillName,
        drillCategory,
        skillLevel: user.skillLevel,
        status,
        endTime: endTime ? new Date(endTime) : null,
        timeSpent,
        performanceScore: performanceScore ? parseFloat(performanceScore) : null,
        repetitions,
        notes,
      },
    });

    // Update SkillProgress if drill is completed
    if (status === 'COMPLETED') {
      const skillProgress = await prisma.skillProgress.upsert({
        where: {
          userId_skillName: {
            userId: user.id,
            skillName: drillCategory,
          },
        },
        update: {
          lastPracticed: new Date(),
          totalSessions: { increment: 1 },
          proficiency: { increment: performanceScore ? performanceScore / 20 : 1 }, // Small increment
        },
        create: {
          userId: user.id,
          skillName: drillCategory,
          proficiency: performanceScore || 0,
          lastPracticed: new Date(),
          totalSessions: 1,
        },
      });
    }

    return NextResponse.json({ 
      success: true,
      drillCompletionId: drillCompletion.id 
    });
  } catch (error) {
    console.error('Drill completion tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track drill completion' },
      { status: 500 }
    );
  }
}

// Update drill completion
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      drillCompletionId,
      status,
      endTime,
      timeSpent,
      performanceScore,
      repetitions,
      notes
    } = body;

    if (!drillCompletionId) {
      return NextResponse.json({ error: 'Drill completion ID required' }, { status: 400 });
    }

    await prisma.drillCompletion.update({
      where: { id: drillCompletionId },
      data: {
        status,
        endTime: endTime ? new Date(endTime) : undefined,
        timeSpent,
        performanceScore: performanceScore ? parseFloat(performanceScore) : undefined,
        repetitions,
        notes,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Drill completion update error:', error);
    return NextResponse.json(
      { error: 'Failed to update drill completion' },
      { status: 500 }
    );
  }
}
