import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { redemptionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { redemptionId } = params;
    const body = await request.json();
    const { status, trackingNumber, cancellationReason } = body;

    // Get sponsor profile
    const sponsorProfile = await prisma.sponsorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!sponsorProfile) {
      return NextResponse.json({ error: 'Sponsor profile not found' }, { status: 404 });
    }

    // Verify this redemption belongs to this sponsor's product
    const redemption = await prisma.rewardRedemption.findFirst({
      where: {
        id: redemptionId,
        product: {
          sponsorId: sponsorProfile.id,
        },
      },
    });

    if (!redemption) {
      return NextResponse.json(
        { error: 'Redemption not found or access denied' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    // Add tracking number if provided
    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }

    // Set timestamps based on status
    if (status === 'SHIPPED' && !redemption.shippedAt) {
      updateData.shippedAt = new Date();
    }

    if (status === 'DELIVERED' && !redemption.deliveredAt) {
      updateData.deliveredAt = new Date();
    }

    if (status === 'CANCELLED') {
      updateData.cancelledAt = new Date();
      updateData.cancellationReason = cancellationReason || 'No reason provided';
      
      // Refund points to user
      await prisma.user.update({
        where: { id: redemption.userId },
        data: {
          rewardPoints: {
            increment: redemption.pointsSpent,
          },
        },
      });
      
      updateData.pointsRefunded = true;
    }

    // Update redemption
    const updatedRedemption = await prisma.rewardRedemption.update({
      where: { id: redemptionId },
      data: updateData,
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
    });

    return NextResponse.json({ redemption: updatedRedemption }, { status: 200 });
  } catch (error) {
    console.error('Error updating redemption:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { redemptionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { redemptionId } = params;

    // Get sponsor profile
    const sponsorProfile = await prisma.sponsorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!sponsorProfile) {
      return NextResponse.json({ error: 'Sponsor profile not found' }, { status: 404 });
    }

    // Get redemption details
    const redemption = await prisma.rewardRedemption.findFirst({
      where: {
        id: redemptionId,
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
            description: true,
          },
        },
      },
    });

    if (!redemption) {
      return NextResponse.json(
        { error: 'Redemption not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({ redemption }, { status: 200 });
  } catch (error) {
    console.error('Error fetching redemption:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
