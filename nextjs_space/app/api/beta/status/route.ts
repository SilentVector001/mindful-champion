
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is a beta tester
    const betaTester = await prisma.betaTester.findUnique({
      where: {
        userId: session.user.id
      },
      include: {
        promoCode: {
          select: {
            code: true,
            rewardAmount: true,
            description: true
          }
        }
      }
    });

    if (!betaTester) {
      return NextResponse.json({
        isBetaTester: false,
        message: 'User is not enrolled in beta testing program'
      });
    }

    // Parse task progress
    const taskProgress = Array.isArray(betaTester.taskProgress) 
      ? betaTester.taskProgress 
      : [];

    return NextResponse.json({
      isBetaTester: true,
      betaTester: {
        id: betaTester.id,
        status: betaTester.status,
        totalTasksCompleted: betaTester.totalTasksCompleted,
        totalTasksRequired: betaTester.totalTasksRequired,
        rewardEligible: betaTester.rewardEligible,
        rewardClaimed: betaTester.rewardClaimed,
        rewardAmount: betaTester.promoCode.rewardAmount,
        startedAt: betaTester.startedAt,
        completedAt: betaTester.completedAt,
        taskProgress: taskProgress
      }
    });

  } catch (error) {
    console.error('Error fetching beta status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch beta testing status' },
      { status: 500 }
    );
  }
}
