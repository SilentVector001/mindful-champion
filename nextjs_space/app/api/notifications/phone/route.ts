// @ts-nocheck
/**
 * Phone Number Management API
 * Handles phone number verification and management for SMS notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { sendVerificationCodeSMS, isValidPhoneNumber, formatPhoneNumber } from '@/lib/notifications/sms-service';

// Generate 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * POST - Send verification code to phone number
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
    }

    if (!isValidPhoneNumber(phoneNumber)) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);

    // Check rate limiting - max 3 codes per hour
    const recentCodes = await prisma.sMSVerificationCode.count({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
        }
      }
    });

    if (recentCodes >= 3) {
      return NextResponse.json({ 
        error: 'Too many verification attempts. Please try again later.' 
      }, { status: 429 });
    }

    // Generate and save verification code
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing codes for this user
    await prisma.sMSVerificationCode.deleteMany({
      where: { userId: session.user.id }
    });

    // Create new verification code
    await prisma.sMSVerificationCode.create({
      data: {
        userId: session.user.id,
        phoneNumber: formattedPhone,
        code,
        expiresAt
      }
    });

    // Send SMS with code
    const result = await sendVerificationCodeSMS(formattedPhone, code);

    if (!result.success) {
      return NextResponse.json({ 
        error: result.error || 'Failed to send verification code' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Verification code sent' 
    });

  } catch (error) {
    console.error('Phone verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT - Verify phone number with code
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Verification code required' }, { status: 400 });
    }

    // Find valid verification code
    const verification = await prisma.sMSVerificationCode.findFirst({
      where: {
        userId: session.user.id,
        code,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (!verification) {
      return NextResponse.json({ 
        error: 'Invalid or expired verification code' 
      }, { status: 400 });
    }

    // Update user with verified phone number
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        phoneNumber: verification.phoneNumber,
        phoneNumberVerified: true
      }
    });

    // Delete the used verification code
    await prisma.sMSVerificationCode.delete({
      where: { id: verification.id }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Phone number verified successfully' 
    });

  } catch (error) {
    console.error('Phone verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE - Remove phone number
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        phoneNumber: null,
        phoneNumberVerified: false
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Phone number removed' 
    });

  } catch (error) {
    console.error('Phone removal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET - Get current phone status
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        phoneNumber: true,
        phoneNumberVerified: true
      }
    });

    return NextResponse.json({
      phoneNumber: user?.phoneNumber || null,
      verified: user?.phoneNumberVerified || false
    });

  } catch (error) {
    console.error('Phone status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
