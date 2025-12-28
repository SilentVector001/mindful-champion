
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { normalizePhoneNumber } from '@/lib/sms/twilio';
import { SMSVerificationType } from '@/lib/prisma-types';
import bcrypt from 'bcryptjs';

const MAX_VERIFICATION_ATTEMPTS = 3;

export async function POST(request: Request) {
  try {
    const { phoneNumber, code, newPassword } = await request.json();

    if (!phoneNumber || !code || !newPassword) {
      return NextResponse.json(
        { error: 'Phone number, code, and new password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    // Find valid verification code
    const verificationCode = await prisma.sMSVerificationCode.findFirst({
      where: {
        phoneNumber: normalizedPhone,
        code,
        type: 'PASSWORD_RESET',
        used: false,
        expiresAt: {
          gt: new Date(),
        },
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

    // Code is valid - update password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    await prisma.user.update({
      where: { id: verificationCode.userId! },
      data: {
        password: hashedPassword,
        passwordChangedAt: new Date(),
      },
    });

    // Mark code as used
    await prisma.sMSVerificationCode.update({
      where: { id: verificationCode.id },
      data: { used: true, usedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now sign in with your new password.',
    });
    
  } catch (error) {
    console.error('SMS password reset verification error:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
