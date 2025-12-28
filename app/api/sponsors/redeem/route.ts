import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

// Redeem an offer
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const { offerId, shippingAddress } = data;

    // Get offer details
    const offer = await prisma.sponsorOffer.findUnique({
      where: { id: offerId },
      include: { sponsor: true }
    });

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    // Verify offer is active and approved
    if (offer.status !== 'ACTIVE' || !offer.isApproved) {
      return NextResponse.json({ error: 'Offer is not available' }, { status: 400 });
    }

    // Check dates
    const now = new Date();
    if (now < offer.startDate || now > offer.endDate) {
      return NextResponse.json({ error: 'Offer is not currently active' }, { status: 400 });
    }

    // Check stock
    if (!offer.unlimitedStock && offer.stockQuantity !== null && offer.currentRedemptions >= offer.stockQuantity) {
      return NextResponse.json({ error: 'Offer is out of stock' }, { status: 400 });
    }

    // Check max total redemptions
    if (offer.maxTotalRedemptions && offer.currentRedemptions >= offer.maxTotalRedemptions) {
      return NextResponse.json({ error: 'Offer redemption limit reached' }, { status: 400 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        rewardPoints: true,
        skillLevel: true,
        subscriptionTier: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check user has enough points
    if (user.rewardPoints < offer.pointsCost) {
      return NextResponse.json(
        { 
          error: 'Insufficient points',
          required: offer.pointsCost,
          current: user.rewardPoints,
          needed: offer.pointsCost - user.rewardPoints
        },
        { status: 400 }
      );
    }

    // Check skill level requirement
    if (offer.requiredSkillLevel) {
      const skillLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PRO'];
      const userLevel = skillLevels.indexOf(user.skillLevel);
      const requiredLevel = skillLevels.indexOf(offer.requiredSkillLevel);
      if (userLevel < requiredLevel) {
        return NextResponse.json(
          { error: `This offer requires ${offer.requiredSkillLevel} skill level or higher` },
          { status: 403 }
        );
      }
    }

    // Check tier exclusivity
    if (offer.exclusiveToTier) {
      const tiers = ['FREE', 'TRIAL', 'PRO', 'PREMIUM'];
      const userTier = tiers.indexOf(user.subscriptionTier);
      const requiredTier = tiers.indexOf(offer.exclusiveToTier);
      if (userTier < requiredTier) {
        return NextResponse.json(
          { error: `This offer is exclusive to ${offer.exclusiveToTier} members` },
          { status: 403 }
        );
      }
    }

    // Check user redemption limit
    const userRedemptions = await prisma.offerRedemption.count({
      where: {
        userId: session.user.id,
        offerId: offerId,
        status: { notIn: ['CANCELLED', 'REFUNDED'] }
      }
    });

    if (userRedemptions >= offer.maxRedemptionsPerUser) {
      return NextResponse.json(
        { error: `You have reached the redemption limit for this offer (${offer.maxRedemptionsPerUser})` },
        { status: 400 }
      );
    }

    // Generate confirmation code
    const confirmationCode = `MC-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Create redemption in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Deduct points from user
      const updatedUser = await tx.user.update({
        where: { id: session.user.id },
        data: { rewardPoints: { decrement: offer.pointsCost } }
      });

      // Award bonus points if applicable
      let bonusPointsEarned = 0;
      if (offer.achievementBonusPoints) {
        await tx.user.update({
          where: { id: session.user.id },
          data: { rewardPoints: { increment: offer.achievementBonusPoints } }
        });
        bonusPointsEarned = offer.achievementBonusPoints;
      }

      // Create redemption record
      const redemption = await tx.offerRedemption.create({
        data: {
          userId: session.user.id,
          offerId: offerId,
          sponsorId: offer.sponsorId,
          pointsSpent: offer.pointsCost,
          bonusPointsEarned: bonusPointsEarned || null,
          retailValue: offer.retailValue,
          confirmationCode: confirmationCode,
          shippingAddress: shippingAddress || null,
          status: 'PENDING'
        }
      });

      // Increment offer redemption count
      await tx.sponsorOffer.update({
        where: { id: offerId },
        data: {
          currentRedemptions: { increment: 1 },
          redemptionCount: { increment: 1 },
          clickCount: { increment: 1 }
        }
      });

      // Update sponsor stats
      await tx.sponsorProfile.update({
        where: { id: offer.sponsorId },
        data: {
          totalRedemptions: { increment: 1 },
          totalRevenue: { increment: offer.retailValue }
        }
      });

      return { redemption, updatedUser, bonusPointsEarned };
    });

    return NextResponse.json({
      success: true,
      redemption: result.redemption,
      confirmationCode: confirmationCode,
      pointsRemaining: result.updatedUser.rewardPoints,
      bonusPointsEarned: result.bonusPointsEarned,
      message: 'Offer redeemed successfully! Check your email for confirmation details.'
    });
  } catch (error) {
    console.error('Redeem offer error:', error);
    return NextResponse.json(
      { error: 'Failed to redeem offer' },
      { status: 500 }
    );
  }
}

// Get user's redemptions
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const where: any = { userId: session.user.id };
    if (status) where.status = status;

    const redemptions = await prisma.offerRedemption.findMany({
      where,
      include: {
        offer: {
          include: {
            sponsor: {
              select: {
                companyName: true,
                logo: true,
                contactEmail: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ redemptions });
  } catch (error) {
    console.error('Get redemptions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch redemptions' },
      { status: 500 }
    );
  }
}
