
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { normalizePhoneNumber } from '@/lib/sms/twilio';
import { SMSVerificationType } from '@prisma/client';

const MAX_VERIFICATION_ATTEMPTS = 5;

export async function POST(request: Request) {
  try {
    const { email, code, useBackupCode } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.twoFactorEnabled) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Handle backup code
    if (useBackupCode) {
      const backupCodes = user.twoFactorBackupCodes as string[] | null;
      
      if (!backupCodes || !backupCodes.includes(code.toUpperCase())) {
        return NextResponse.json(
          { error: 'Invalid backup code' },
          { status: 401 }
        );
      }

      // Remove used backup code
      const updatedCodes = backupCodes.filter(bc => bc !== code.toUpperCase());
      await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorBackupCodes: updatedCodes },
      });

      return NextResponse.json({
        success: true,
        message: '2FA verification successful!',
        userId: user.id,
      });
    }

    // Handle SMS code
    if (!user.phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number not configured' },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhoneNumber(user.phoneNumber);

    // Find valid verification code
    const verificationCode = await prisma.sMSVerificationCode.findFirst({
      where: {
        userId: user.id,
        phoneNumber: normalizedPhone,
        type: SMSVerificationType.TWO_FACTOR_AUTH,
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
        { status: 401 }
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
        { status: 401 }
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
        { status: 401 }
      );
    }

    // Code is valid
    await prisma.sMSVerificationCode.update({
      where: { id: verificationCode.id },
      data: { used: true, usedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: '2FA verification successful!',
      userId: user.id,
    });
    
  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
