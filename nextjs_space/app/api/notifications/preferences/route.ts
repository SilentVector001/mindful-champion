// Notification Preferences API
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's notification preferences
    const prefs = await prisma.notificationPreferences.findFirst({
      where: { userId: session.user.id }
    })

    // Get user's phone number status
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        phoneNumber: true,
        phoneNumberVerified: true,
        notificationPreferences: true
      }
    })

    return NextResponse.json({
      preferences: {
        email: prefs?.emailEnabled ?? true,
        push: prefs?.pushEnabled ?? true,
        inApp: prefs?.inAppEnabled ?? true,
        sms: user?.phoneNumberVerified ?? false,
        frequency: prefs?.frequency || 'DAILY',
        timezone: prefs?.timezone || 'America/New_York'
      },
      phone: {
        number: user?.phoneNumber ? user.phoneNumber.replace(/(.{3})(.*)(.{2})/, '$1*****$3') : null,
        verified: user?.phoneNumberVerified ?? false
      }
    })
  } catch (error: any) {
    console.error('Get notification preferences error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email, push, inApp, sms, frequency, timezone } = await request.json()

    // Update or create notification preferences
    const prefs = await prisma.notificationPreferences.upsert({
      where: {
        userId_category: {
          userId: session.user.id,
          category: 'GOALS'
        }
      },
      update: {
        emailEnabled: email ?? true,
        pushEnabled: push ?? true,
        inAppEnabled: inApp ?? true,
        frequency: frequency || 'DAILY',
        timezone: timezone || 'America/New_York'
      },
      create: {
        userId: session.user.id,
        category: 'GOALS',
        emailEnabled: email ?? true,
        pushEnabled: push ?? true,
        inAppEnabled: inApp ?? true,
        frequency: frequency || 'DAILY',
        timezone: timezone || 'America/New_York'
      }
    })

    // If SMS enabled but phone not verified, return warning
    if (sms) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { phoneNumberVerified: true }
      })
      
      if (!user?.phoneNumberVerified) {
        return NextResponse.json({
          success: true,
          preferences: prefs,
          warning: 'Please verify your phone number to enable SMS notifications'
        })
      }
    }

    return NextResponse.json({
      success: true,
      preferences: prefs
    })
  } catch (error: any) {
    console.error('Update notification preferences error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
