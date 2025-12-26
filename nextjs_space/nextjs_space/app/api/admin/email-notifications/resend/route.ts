export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { emailService } from '@/lib/email/email-service'

/**
 * POST /api/admin/email-notifications/resend
 * Resend a failed email notification
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { emailNotificationId } = body
    
    if (!emailNotificationId) {
      return NextResponse.json(
        { error: 'Email notification ID is required' },
        { status: 400 }
      )
    }
    
    // Retry sending the email
    const result = await emailService.retryEmail(emailNotificationId)
    
    if (result.success) {
      return NextResponse.json({
        message: 'Email resent successfully',
        emailId: result.emailId,
      })
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to resend email' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Error resending email:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to resend email' },
      { status: 500 }
    )
  }
}
