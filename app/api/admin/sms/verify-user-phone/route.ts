
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { UserRole } from '@/lib/prisma-types';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();

    // Check if user is admin
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!admin || admin.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get target user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.phoneNumber) {
      return NextResponse.json(
        { error: 'User does not have a phone number set' },
        { status: 400 }
      );
    }

    // Manually verify phone
    await prisma.user.update({
      where: { id: user.id },
      data: {
        phoneNumberVerified: true,
        phoneVerifiedAt: new Date(),
      },
    });

    // Log admin action
    await prisma.securityLog.create({
      data: {
        userId: user.id,
        eventType: 'SUCCESSFUL_LOGIN',
        severity: 'LOW',
        description: `Admin ${admin.email} manually verified phone number for user ${user.email}`,
        metadata: {
          adminId: admin.id,
          adminEmail: admin.email,
          targetUserId: user.id,
          targetUserEmail: user.email,
          phoneNumber: user.phoneNumber,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Phone number verified for ${user.email}`,
    });
    
  } catch (error) {
    console.error('Admin phone verification error:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
