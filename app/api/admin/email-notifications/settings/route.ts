
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * GET /api/admin/email-notifications/settings
 * Get email settings
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    let settings = await prisma.emailSettings.findFirst()
    
    // Create default settings if they don't exist
    if (!settings) {
      settings = await prisma.emailSettings.create({
        data: {},
      })
    }
    
    return NextResponse.json({ settings })
  } catch (error: any) {
    console.error('Error fetching email settings:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/email-notifications/settings
 * Update email settings
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const {
      emailNotificationsEnabled,
      videoAnalysisEmailsEnabled,
      welcomeEmailsEnabled,
      marketingEmailsEnabled,
      maxRetryAttempts,
      retryDelayMinutes,
      fromEmail,
      fromName,
      replyToEmail,
    } = body
    
    // Get or create settings
    let settings = await prisma.emailSettings.findFirst()
    
    if (!settings) {
      settings = await prisma.emailSettings.create({
        data: {},
      })
    }
    
    // Update settings
    const updatedSettings = await prisma.emailSettings.update({
      where: { id: settings.id },
      data: {
        ...(emailNotificationsEnabled !== undefined && { emailNotificationsEnabled }),
        ...(videoAnalysisEmailsEnabled !== undefined && { videoAnalysisEmailsEnabled }),
        ...(welcomeEmailsEnabled !== undefined && { welcomeEmailsEnabled }),
        ...(marketingEmailsEnabled !== undefined && { marketingEmailsEnabled }),
        ...(maxRetryAttempts !== undefined && { maxRetryAttempts }),
        ...(retryDelayMinutes !== undefined && { retryDelayMinutes }),
        ...(fromEmail && { fromEmail }),
        ...(fromName && { fromName }),
        ...(replyToEmail !== undefined && { replyToEmail }),
      },
    })
    
    return NextResponse.json({
      settings: updatedSettings,
      message: 'Settings updated successfully',
    })
  } catch (error: any) {
    console.error('Error updating email settings:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update settings' },
      { status: 500 }
    )
  }
}
