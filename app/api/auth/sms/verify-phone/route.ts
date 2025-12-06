
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { normalizePhoneNumber } from '@/lib/sms/twilio';
import { SMSVerificationType } from '@prisma/client';

const MAX_VERIFICATION_ATTEMPTS = 3;

export async function POST(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Verification code is required' },
        { status: 400 }
      );
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.phoneNumber) {
      return NextResponse.json(
        { error: 'No phone number found for this account' },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhoneNumber(user.phoneNumber);

    // Find valid verification code
    const verificationCode = await prisma.sMSVerificationCode.findFirst({
      where: {
        userId: user.id,
        phoneNumber: normalizedPhone,
        type: SMSVerificationType.PHONE_VERIFICATION,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!verificationCode) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    // Check attempts
    if (verificationCode.attemptsCount >= MAX_VERIFICATION_ATTEMPTS) {
      await prisma.sMSVerificationCode.update({
        where: { id: verificationCode.id },
        data: { used: true },
      });
      
      return NextResponse.json(
        { error: 'Too many verification attempts. Please request a new code.' },
        { status: 400 }
      );
    }

    // If code doesn't match, increment attempts
    if (verificationCode.code !== code) {
      await prisma.sMSVerificationCode.update({
        where: { id: verificationCode.id },
        data: { attemptsCount: verificationCode.attemptsCount + 1 },
      });
      
      return NextResponse.json(
        { 
          error: 'Invalid verification code',
          remainingAttempts: MAX_VERIFICATION_ATTEMPTS - (verificationCode.attemptsCount + 1)
        },
        { status: 400 }
      );
    }

    // Code is valid - verify phone number
    await prisma.user.update({
      where: { id: user.id },
      data: {
        phoneNumberVerified: true,
        phoneVerifiedAt: new Date(),
      },
    });

    // Mark code as used
    await prisma.sMSVerificationCode.update({
      where: { id: verificationCode.id },
      data: { used: true, usedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: 'Phone number verified successfully!',
    });
    
  } catch (error) {
    console.error('Phone verification error:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
