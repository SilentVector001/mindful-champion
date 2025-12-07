
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { 
  generateSecureCode, 
  sendPasswordResetSMS, 
  isValidPhoneNumber, 
  normalizePhoneNumber 
} from '@/lib/sms/twilio';
import { SMSVerificationType } from '@/lib/prisma-types';

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Validate phone number format
    if (!isValidPhoneNumber(phoneNumber)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    // Find user by phone number
    const user = await prisma.user.findFirst({
      where: { 
        phoneNumber: normalizedPhone,
        phoneNumberVerified: true // Only allow verified phone numbers
      }
    });

    // Always return success (security best practice - don't reveal if phone exists)
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If a verified account with that phone number exists, you will receive a password reset code.',
      });
    }

    // Generate 6-digit code
    const code = generateSecureCode(6);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store code in database
    await prisma.sMSVerificationCode.create({
      data: {
        userId: user.id,
        phoneNumber: normalizedPhone,
        code,
        type: SMSVerificationType.PASSWORD_RESET,
        expiresAt,
        used: false,
        attemptsCount: 0,
      },
    });

    // Send SMS
    const result = await sendPasswordResetSMS(normalizedPhone, code);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send SMS. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset code sent to your phone.',
    });
    
  } catch (error) {
    console.error('SMS password reset request error:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
