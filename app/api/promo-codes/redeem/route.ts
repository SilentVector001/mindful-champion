
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { PromoCodeStatus, SubscriptionTier } from '@/lib/prisma-types';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { code } = await req.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Invalid promo code format' },
        { status: 400 }
      );
    }

    // Find the promo code
    const promoCode = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase().trim() }
    });

    if (!promoCode) {
      return NextResponse.json(
        { error: 'Invalid promo code' },
        { status: 404 }
      );
    }

    // Check if code is active
    if (promoCode.status !== PromoCodeStatus.ACTIVE) {
      return NextResponse.json(
        { error: 'This promo code is no longer active' },
        { status: 400 }
      );
    }

    // Check if expired
    if (promoCode.expiresAt && new Date() > promoCode.expiresAt) {
      // Update code status to EXPIRED
      await prisma.promoCode.update({
        where: { id: promoCode.id },
        data: { status: PromoCodeStatus.EXPIRED }
      });
      
      return NextResponse.json(
        { error: 'This promo code has expired' },
        { status: 400 }
      );
    }

    // Check if max redemptions reached
    if (promoCode.timesRedeemed >= promoCode.maxRedemptions) {
      return NextResponse.json(
        { error: 'This promo code has reached its maximum usage limit' },
        { status: 400 }
      );
    }

    // Check if user has already redeemed this code
    const existingRedemption = await prisma.promoCode.findFirst({
      where: {
        code: code.toUpperCase().trim(),
        redeemedBy: session.user.id
      }
    });

    if (existingRedemption) {
      return NextResponse.json(
        { error: 'You have already redeemed this promo code' },
        { status: 400 }
      );
    }

    // All checks passed - redeem the code!
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + promoCode.durationDays);

    // Start a transaction to update user and promo code
    const result = await prisma.$transaction(async (tx) => {
      // Update user subscription
      const updatedUser = await tx.user.update({
        where: { id: session.user.id },
        data: {
          subscriptionTier: SubscriptionTier.PRO,
          trialEndDate: trialEndDate,
          isTrialActive: true,
          trialStartDate: new Date()
        }
      });

      // Update promo code
      const updatedPromoCode = await tx.promoCode.update({
        where: { id: promoCode.id },
        data: {
          timesRedeemed: { increment: 1 },
          redeemedBy: session.user.id,
          redeemedAt: new Date(),
          status: promoCode.timesRedeemed + 1 >= promoCode.maxRedemptions 
            ? PromoCodeStatus.REDEEMED 
            : PromoCodeStatus.ACTIVE
        }
      });

      // If this is a beta tester code, create BetaTester record
      if (promoCode.isBetaTester && promoCode.betaTasks) {
        await tx.betaTester.create({
          data: {
            userId: session.user.id,
            promoCodeId: promoCode.id,
            status: 'ACTIVE',
            taskProgress: promoCode.betaTasks,
            totalTasksRequired: Array.isArray(promoCode.betaTasks) 
              ? (promoCode.betaTasks as any[]).length 
              : 7,
            totalTasksCompleted: 0,
            rewardEligible: false,
            rewardClaimed: false
          }
        });
      }

      return { updatedUser, updatedPromoCode };
    });

    return NextResponse.json({
      success: true,
      message: 'Promo code redeemed successfully!',
      details: {
        subscriptionTier: result.updatedUser.subscriptionTier,
        trialEndDate: result.updatedUser.trialEndDate,
        durationDays: promoCode.durationDays,
        isBetaTester: promoCode.isBetaTester,
        rewardAmount: promoCode.rewardAmount,
        description: promoCode.description
      }
    });

  } catch (error) {
    console.error('Error redeeming promo code:', error);
    return NextResponse.json(
      { error: 'Failed to redeem promo code. Please try again.' },
      { status: 500 }
    );
  }
}

// Get user's redeemed codes
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const redeemedCodes = await prisma.promoCode.findMany({
      where: {
        redeemedBy: session.user.id
      },
      select: {
        code: true,
        description: true,
        redeemedAt: true,
        durationDays: true,
        isBetaTester: true,
        rewardAmount: true
      },
      orderBy: {
        redeemedAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      redeemedCodes
    });

  } catch (error) {
    console.error('Error fetching redeemed codes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch redeemed codes' },
      { status: 500 }
    );
  }
}
