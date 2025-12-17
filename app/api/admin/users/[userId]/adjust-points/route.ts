export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { awardPoints, deductPoints } from '@/lib/rewards/award-points';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { points, reason } = body;

    if (typeof points !== 'number' || points === 0) {
      return NextResponse.json({ error: 'Invalid points value' }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, rewardPoints: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let result;
    const adjustmentReason = reason ?? 'Admin manual adjustment';

    if (points > 0) {
      // Award points
      result = await awardPoints(userId, points, adjustmentReason);
    } else {
      // Deduct points (convert to positive for deduction)
      result = await deductPoints(userId, Math.abs(points), adjustmentReason);
    }

    if (!result?.success) {
      return NextResponse.json(
        { error: result?.error ?? 'Failed to adjust points' },
        { status: 400 }
      );
    }

    // Log the admin action
    console.log(
      `🛠️ Admin ${session.user.email} adjusted points for user ${user.email}: ${points > 0 ? '+' : ''}${points} (${adjustmentReason})`
    );

    return NextResponse.json({
      success: true,
      newTotal: result?.newTotal ?? 0,
      adjustment: points,
      message: `Points ${points > 0 ? 'added' : 'deducted'} successfully`
    });
  } catch (error) {
    console.error('Error adjusting points:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
