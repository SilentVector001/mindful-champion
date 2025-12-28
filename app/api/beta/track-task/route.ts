
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { taskId } = await req.json();

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Get beta tester record
    const betaTester = await prisma.betaTester.findUnique({
      where: { userId: session.user.id }
    });

    if (!betaTester) {
      return NextResponse.json(
        { error: 'User is not a beta tester' },
        { status: 404 }
      );
    }

    // Parse current task progress
    const taskProgress = Array.isArray(betaTester.taskProgress) 
      ? betaTester.taskProgress as any[]
      : [];

    // Find and update the task
    const taskIndex = taskProgress.findIndex((t: any) => t.id === taskId);
    
    if (taskIndex === -1) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // If task is already completed, return early
    if (taskProgress[taskIndex].completed) {
      return NextResponse.json({
        success: true,
        message: 'Task already completed',
        alreadyCompleted: true
      });
    }

    // Mark task as completed
    taskProgress[taskIndex].completed = true;
    const newTotalCompleted = betaTester.totalTasksCompleted + 1;
    const allTasksCompleted = newTotalCompleted >= betaTester.totalTasksRequired;

    // Update beta tester record
    const updated = await prisma.betaTester.update({
      where: { id: betaTester.id },
      data: {
        taskProgress: taskProgress,
        totalTasksCompleted: newTotalCompleted,
        rewardEligible: allTasksCompleted,
        status: allTasksCompleted ? 'COMPLETED' : 'ACTIVE',
        completedAt: allTasksCompleted ? new Date() : null
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Task marked as completed',
      totalTasksCompleted: newTotalCompleted,
      totalTasksRequired: betaTester.totalTasksRequired,
      allTasksCompleted,
      rewardEligible: updated.rewardEligible
    });

  } catch (error) {
    console.error('Error tracking beta task:', error);
    return NextResponse.json(
      { error: 'Failed to track task completion' },
      { status: 500 }
    );
  }
}
