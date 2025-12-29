import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: {
        sponsorProfile: true,
      },
    });

    if (!user || !user.sponsorProfile) {
      return NextResponse.json(
        { error: 'Not authorized as a sponsor' },
        { status: 403 }
      );
    }

    const redemptions = await prisma.redemption.findMany({
      where: {
        offer: {
          sponsorId: user.sponsorProfile.id,
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
        offer: {
          select: {
            id: true,
            title: true,
            pointsCost: true,
          },
        },
      },
      orderBy: {
        redeemedAt: 'desc',
      },
    });

    return NextResponse.json(redemptions);
  } catch (error) {
    console.error('Error fetching redemptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch redemptions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: {
        sponsorProfile: true,
      },
    });

    if (!user || !user.sponsorProfile) {
      return NextResponse.json(
        { error: 'Not authorized as a sponsor' },
        { status: 403 }
      );
    }

    const { redemptionId, status } = await request.json();

    if (!['APPROVED', 'REJECTED', 'FULFILLED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const redemption = await prisma.redemption.findUnique({
      where: { id: redemptionId },
      include: {
        offer: true,
      },
    });

    if (!redemption) {
      return NextResponse.json(
        { error: 'Redemption not found' },
        { status: 404 }
      );
    }

    if (redemption.offer.sponsorId !== user.sponsorProfile.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this redemption' },
        { status: 403 }
      );
    }

    const updatedRedemption = await prisma.redemption.update({
      where: { id: redemptionId },
      data: {
        status: status as any,
        fulfilledAt: status === 'FULFILLED' ? new Date() : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        offer: {
          select: {
            id: true,
            title: true,
            pointsCost: true,
          },
        },
      },
    });

    return NextResponse.json(updatedRedemption);
  } catch (error) {
    console.error('Error updating redemption:', error);
    return NextResponse.json(
      { error: 'Failed to update redemption' },
      { status: 500 }
    );
  }
}