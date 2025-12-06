import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Mark celebration as shown for a tier unlock
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { unlockId } = await req.json();

    if (!unlockId) {
      return NextResponse.json({ error: 'Unlock ID required' }, { status: 400 });
    }

    // Update the unlock record
    await prisma.tierUnlock.update({
      where: { 
        id: unlockId,
        userId: session.user.id // Ensure user owns this unlock
      },
      data: { celebrationShown: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark celebration shown error:', error);
    return NextResponse.json(
      { error: 'Failed to mark celebration as shown' },
      { status: 500 }
    );
  }
}
