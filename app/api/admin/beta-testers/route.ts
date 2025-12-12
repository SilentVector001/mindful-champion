
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const rewardStatus = searchParams.get('rewardStatus');

    const where: any = {};
    
    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (rewardStatus === 'ELIGIBLE') {
      where.rewardEligible = true;
      where.rewardClaimed = false;
    } else if (rewardStatus === 'CLAIMED') {
      where.rewardClaimed = true;
    }

    const betaTesters = await prisma.betaTester.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        promoCode: {
          select: {
            code: true,
            rewardAmount: true,
            assignedTo: true
          }
        }
      },
      orderBy: { startedAt: 'desc' }
    });

    // Get summary stats
    const stats = {
      total: betaTesters.length,
      active: betaTesters.filter((t: any) => t.status === 'ACTIVE').length,
      completed: betaTesters.filter((t: any) => t.status === 'COMPLETED').length,
      rewardEligible: betaTesters.filter((t: any) => t.rewardEligible && !t.rewardClaimed).length,
      rewardsClaimed: betaTesters.filter((t: any) => t.rewardClaimed).length,
      averageCompletion: betaTesters.length > 0
        ? Math.round((betaTesters.reduce((sum: number, t: any) => sum + t.totalTasksCompleted, 0) / betaTesters.length / 7) * 100)
        : 0
    };

    return NextResponse.json({
      betaTesters,
      stats
    });

  } catch (error) {
    console.error('Error fetching beta testers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch beta testers' },
      { status: 500 }
    );
  }
}

// Mark reward as claimed
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { betaTesterId, giftCardCode, notes } = await req.json();

    if (!betaTesterId) {
      return NextResponse.json(
        { error: 'Beta tester ID is required' },
        { status: 400 }
      );
    }

    const updated = await prisma.betaTester.update({
      where: { id: betaTesterId },
      data: {
        rewardClaimed: true,
        rewardClaimedAt: new Date(),
        rewardDetails: {
          giftCardCode,
          notes,
          claimedBy: session.user.email,
          claimedAt: new Date().toISOString()
        }
      }
    });

    return NextResponse.json({
      success: true,
      betaTester: updated
    });

  } catch (error) {
    console.error('Error marking reward as claimed:', error);
    return NextResponse.json(
      { error: 'Failed to mark reward as claimed' },
      { status: 500 }
    );
  }
}
