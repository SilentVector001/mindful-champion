
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * This endpoint forces a session refresh by fetching fresh user data
 * Useful after onboarding completion to update JWT token
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // The act of getting the session will trigger a JWT refresh
    // The JWT callback is configured to refresh data more frequently
    return NextResponse.json({ 
      success: true,
      message: 'Session refreshed',
      onboardingCompleted: session.user.onboardingCompleted,
      user: {
        id: session.user.id,
        email: session.user.email,
        onboardingCompleted: session.user.onboardingCompleted
      }
    })
  } catch (error) {
    console.error('Error refreshing session:', error)
    return NextResponse.json({ error: 'Failed to refresh session' }, { status: 500 })
  }
}
