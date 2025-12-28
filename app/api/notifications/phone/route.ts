// Phone Number Management API for SMS Notifications
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { sendSMS } from '@/lib/notifications/sms-service'

// Generate 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { phoneNumber } = await request.json()

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    // Clean and validate phone number
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, '')
    if (!cleanNumber.match(/^\+?1?\d{10,14}$/)) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 })
    }

    // Format to E.164
    const formattedNumber = cleanNumber.startsWith('+') ? cleanNumber : `+1${cleanNumber.replace(/^1/, '')}`

    // Generate verification code
    const code = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Store verification code
    await prisma.sMSVerificationCode.create({
      data: {
        userId: session.user.id,
        phoneNumber: formattedNumber,
        code,
        type: 'PHONE_VERIFICATION',
        expiresAt
      }
    })

    // Update user's phone number (unverified)
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        phoneNumber: formattedNumber,
        phoneNumberVerified: false
      }
    })

    // Send verification SMS
    const smsResult = await sendSMS(
      formattedNumber,
      `Your Mindful Champion verification code is: ${code}\n\nThis code expires in 10 minutes.`
    )

    if (!smsResult.success) {
      return NextResponse.json({ 
        error: 'Failed to send verification code',
        details: smsResult.error 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent',
      expiresIn: 600 // seconds
    })
  } catch (error: any) {
    console.error('Phone verification error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Verify the code
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: 'Verification code is required' }, { status: 400 })
    }

    // Find valid verification code
    const verification = await prisma.sMSVerificationCode.findFirst({
      where: {
        userId: session.user.id,
        code,
        type: 'PHONE_VERIFICATION',
        used: false,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!verification) {
      // Check attempt count
      const recentAttempts = await prisma.sMSVerificationCode.count({
        where: {
          userId: session.user.id,
          type: 'PHONE_VERIFICATION',
          createdAt: { gt: new Date(Date.now() - 60 * 60 * 1000) }
        }
      })

      if (recentAttempts > 5) {
        return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 })
      }

      return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 })
    }

    // Mark code as used
    await prisma.sMSVerificationCode.update({
      where: { id: verification.id },
      data: {
        used: true,
        usedAt: new Date()
      }
    })

    // Update user's phone as verified
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        phoneNumberVerified: true,
        phoneVerifiedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Phone number verified successfully'
    })
  } catch (error: any) {
    console.error('Phone verification error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Remove phone number
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        phoneNumber: null,
        phoneNumberVerified: false,
        phoneVerifiedAt: null
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Phone number removed'
    })
  } catch (error: any) {
    console.error('Phone removal error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
