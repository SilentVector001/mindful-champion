
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { SubscriptionTier } from '@prisma/client';

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, action, subscriptionTier } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'User ID and action are required' },
        { status: 400 }
      );
    }

    // Handle different actions
    switch (action) {
      case 'update-subscription':
        if (!subscriptionTier) {
          return NextResponse.json(
            { error: 'Subscription tier is required' },
            { status: 400 }
          );
        }

        // Update user subscription
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionTier: subscriptionTier as SubscriptionTier,
            // If upgrading to PRO, ensure trial is not active
            ...(subscriptionTier === 'PRO' && {
              isTrialActive: false,
            }),
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            subscriptionTier: true,
            isTrialActive: true,
          },
        });

        return NextResponse.json({
          success: true,
          message: 'Subscription updated successfully',
          user: updatedUser,
        });

      case 'reset-trial':
        // Reset trial for a user
        const trialResetUser = await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionTier: 'TRIAL',
            isTrialActive: true,
            trialStartDate: new Date(),
            trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            subscriptionTier: true,
            isTrialActive: true,
            trialEndDate: true,
          },
        });

        return NextResponse.json({
          success: true,
          message: 'Trial reset successfully',
          user: trialResetUser,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Admin user management error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, role: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent deleting admin users
    if (user.role === 'ADMIN') {
      return NextResponse.json(
        { error: 'Cannot delete admin users' },
        { status: 403 }
      );
    }

    // Delete the user (cascade will handle related records based on schema)
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      success: true,
      message: `User ${user.email} has been deleted`,
    });
  } catch (error) {
    console.error('Admin user deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
