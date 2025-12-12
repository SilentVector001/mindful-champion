import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get sponsor profile
    const sponsorProfile = await prisma.sponsorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!sponsorProfile) {
      return NextResponse.json({ error: 'Sponsor profile not found' }, { status: 404 });
    }

    // Get all redemptions for this sponsor's products
    const redemptions = await prisma.rewardRedemption.findMany({
      where: {
        product: {
          sponsorId: sponsorProfile.id,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            retailValue: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ redemptions }, { status: 200 });
  } catch (error) {
    console.error('Error fetching redemptions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
