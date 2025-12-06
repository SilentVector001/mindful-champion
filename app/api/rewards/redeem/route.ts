
import { NextResponse } from 'next/server';

export const dynamic = "force-dynamic";
import { getServerSession } from 'next-auth';

import { prisma } from '@/lib/db';

import { authOptions } from '@/lib/auth';

import nodemailer from 'nodemailer';


export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        achievementStats: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const product = await prisma.sponsorProduct.findUnique({
      where: { id: productId },
      include: {
        sponsor: true,
      },
    });

    if (!product || !product.isActive || !product.isApproved) {
      return NextResponse.json({ error: 'Product not available' }, { status: 400 });
    }

    // Check if user has enough points
    if (user.rewardPoints < product.pointsCost) {
      return NextResponse.json({ error: 'Insufficient points' }, { status: 400 });
    }

    // Check achievement requirements
    if (product.minAchievements && (!user.achievementStats || user.achievementStats.totalAchievements < product.minAchievements)) {
      return NextResponse.json({ error: 'Achievement requirements not met' }, { status: 400 });
    }

    // Check stock
    if (!product.unlimitedStock && product.stockQuantity < 1) {
      return NextResponse.json({ error: 'Product out of stock' }, { status: 400 });
    }

    // Create redemption and deduct points
    const redemption = await prisma.$transaction(async (tx) => {
      // Deduct points from user
      await tx.user.update({
        where: { id: user.id },
        data: {
          rewardPoints: {
            decrement: product.pointsCost,
          },
        },
      });

      // Decrease stock if not unlimited
      if (!product.unlimitedStock) {
        await tx.sponsorProduct.update({
          where: { id: productId },
          data: {
            stockQuantity: {
              decrement: 1,
            },
          },
        });
      }

      // Update sponsor stats
      await tx.sponsorProfile.update({
        where: { id: product.sponsorId },
        data: {
          totalRedemptions: {
            increment: 1,
          },
        },
      });

      // Create redemption record
      return tx.rewardRedemption.create({
        data: {
          userId: user.id,
          productId: product.id,
          pointsSpent: product.pointsCost,
          status: 'PENDING',
        },
      });
    });

    // Send confirmation email
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Reward Redemption Confirmed - Mindful Champion',
      html: `
        <!DOCTYPE html>
        <html>
        <body>
          <h1>🎉 Reward Redeemed Successfully!</h1>
          <p>Hi ${user.name || 'Champion'},</p>
          <p>You've successfully redeemed <strong>${product.name}</strong> from ${product.sponsor.companyName}!</p>
          <p><strong>Points Spent:</strong> ${product.pointsCost.toLocaleString()}</p>
          <p><strong>Remaining Balance:</strong> ${(user.rewardPoints - product.pointsCost).toLocaleString()} points</p>
          <p>We'll process your redemption and contact you with fulfillment details within 1-2 business days.</p>
          <p>Keep training to earn more points! 🏆</p>
        </body>
        </html>
      `,
    });

    return NextResponse.json({
      success: true,
      redemption,
      remainingPoints: user.rewardPoints - product.pointsCost,
    });
  } catch (error) {
    console.error('Redemption error:', error);
    return NextResponse.json(
      { error: 'Failed to process redemption' },
      { status: 500 }
    );
  }
}
