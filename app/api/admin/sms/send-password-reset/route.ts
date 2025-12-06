
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { 
  generateSecureCode, 
  sendPasswordResetSMS,
  normalizePhoneNumber 
} from '@/lib/sms/twilio';
import { SMSVerificationType, UserRole } from '@prisma/client';

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

    if (!user.phoneNumber || !user.phoneNumberVerified) {
      return NextResponse.json(
        { error: 'User does not have a verified phone number' },
        { status: 400 }
      );
    }

    // Generate code
    const code = generateSecureCode(6);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store code in database
    await prisma.sMSVerificationCode.create({
      data: {
        userId: user.id,
        phoneNumber: normalizePhoneNumber(user.phoneNumber),
        code,
        type: SMSVerificationType.PASSWORD_RESET,
        expiresAt,
        used: false,
        attemptsCount: 0,
      },
    });

    // Send SMS
    const result = await sendPasswordResetSMS(user.phoneNumber, code);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send SMS' },
        { status: 500 }
      );
    }

    // Log admin action
    await prisma.securityLog.create({
      data: {
        userId: user.id,
        eventType: 'PASSWORD_RESET_REQUEST',
        severity: 'MEDIUM',
        description: `Admin ${admin.email} sent password reset SMS to user ${user.email}`,
        metadata: {
          adminId: admin.id,
          adminEmail: admin.email,
          targetUserId: user.id,
          targetUserEmail: user.email,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Password reset SMS sent to ${user.email}`,
    });
    
  } catch (error) {
    console.error('Admin SMS password reset error:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
