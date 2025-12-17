
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { 
  generateSecureCode, 
  send2FACode,
  normalizePhoneNumber 
} from '@/lib/sms/twilio';
import { SMSVerificationType } from '@/lib/prisma-types';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Don't reveal if user exists
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If 2FA is enabled for this account, a code has been sent.',
      });
    }

    // Check if 2FA is enabled
    if (!user.twoFactorEnabled || !user.phoneNumber) {
      return NextResponse.json({
        success: true,
        message: 'If 2FA is enabled for this account, a code has been sent.',
      });
    }

    // Generate and send code
    const code = generateSecureCode(6);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store code in database
    await prisma.sMSVerificationCode.create({
      data: {
        userId: user.id,
        phoneNumber: normalizePhoneNumber(user.phoneNumber),
        code,
        type: 'TWO_FACTOR_AUTH',
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

    return NextResponse.json({
      success: true,
      message: '2FA code sent to your phone.',
      requires2FA: true,
    });
    
  } catch (error) {
    console.error('2FA send code error:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
