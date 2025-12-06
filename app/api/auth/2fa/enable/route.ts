
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { 
  generateSecureCode, 
  send2FACode,
  normalizePhoneNumber 
} from '@/lib/sms/twilio';
import { SMSVerificationType } from '@prisma/client';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if phone is verified
    if (!user.phoneNumberVerified || !user.phoneNumber) {
      return NextResponse.json(
        { error: 'Please verify your phone number before enabling 2FA' },
        { status: 400 }
      );
    }

    // Check if 2FA is already enabled
    if (user.twoFactorEnabled) {
      return NextResponse.json(
        { error: '2FA is already enabled for this account' },
        { status: 400 }
      );
    }

    // Generate 6-digit code for immediate verification
    const code = generateSecureCode(6);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Generate backup codes (10 codes)
    const backupCodes = Array.from({ length: 10 }, () => 
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );

    // Store verification code
    await prisma.sMSVerificationCode.create({
      data: {
        userId: user.id,
        phoneNumber: normalizePhoneNumber(user.phoneNumber),
        code,
        type: SMSVerificationType.TWO_FACTOR_AUTH,
        expiresAt,
        used: false,
        attemptsCount: 0,
      },
    });

    // Send SMS
    const result = await send2FACode(user.phoneNumber, code);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send SMS. Please try again.' },
        { status: 500 }
      );
    }

    // Temporarily store backup codes (they'll be saved after verification)
    // In production, use Redis or session storage for this
    return NextResponse.json({
      success: true,
      message: 'Verification code sent. Please verify to enable 2FA.',
      backupCodes, // Send to user for safekeeping
      requiresVerification: true,
    });
    
  } catch (error) {
    console.error('2FA enable error:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
