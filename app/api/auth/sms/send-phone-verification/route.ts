
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { 
  generateSecureCode, 
  sendPhoneVerificationCode, 
  isValidPhoneNumber, 
  normalizePhoneNumber 
} from '@/lib/sms/twilio';
import { SMSVerificationType } from '@/lib/prisma-types';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

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

    // Check if phone number is already verified by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        phoneNumber: normalizedPhone,
        phoneNumberVerified: true,
        email: {
          not: session.user.email,
        },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'This phone number is already verified by another account' },
        { status: 400 }
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

    // Update user's phone number (unverified)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        phoneNumber: normalizedPhone,
        phoneNumberVerified: false,
      },
    });

    // Generate 6-digit code
    const code = generateSecureCode(6);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store code in database
    await prisma.sMSVerificationCode.create({
      data: {
        userId: user.id,
        phoneNumber: normalizedPhone,
        code,
        type: SMSVerificationType.PHONE_VERIFICATION,
        expiresAt,
        used: false,
        attemptsCount: 0,
      },
    });

    // Send SMS
    const result = await sendPhoneVerificationCode(normalizedPhone, code);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send SMS. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your phone.',
    });
    
  } catch (error) {
    console.error('Phone verification request error:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
