/**
 * Diagnostic API to check all users in the database
 * Used for admin troubleshooting
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Check if user has admin role
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Get all users with their key information
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        role: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        isTrialActive: true,
        trialStartDate: true,
        trialEndDate: true,
        createdAt: true,
        lastActiveDate: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get user count by role
    const [adminCount, userCount, sponsorCount] = await Promise.all([
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.user.count({ where: { role: 'SPONSOR' } }),
    ]);

    // Get subscription stats
    const [freeCount, proCount] = await Promise.all([
      prisma.user.count({ where: { subscriptionTier: 'FREE' } }),
      prisma.user.count({ where: { subscriptionTier: 'PRO' } }),
    ]);

    return NextResponse.json({
      success: true,
      total: users.length,
      stats: {
        byRole: {
          admin: adminCount,
          user: userCount,
          sponsor: sponsorCount,
        },
        bySubscription: {
          free: freeCount,
          pro: proCount,
        },
      },
      users: users,
    });
  } catch (error: any) {
    console.error('❌ Error checking users:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user information',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
