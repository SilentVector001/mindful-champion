
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma as db } from '@/lib/db'
import { getToken } from 'next-auth/jwt'

export const dynamic = 'force-dynamic'

/**
 * Debug endpoint to check session and JWT token status
 * Helpful for diagnosing onboarding redirect loop issues
 */
export async function GET(request: NextRequest) {
  try {
    // Get session
    const session = await getServerSession(authOptions)
    
    // Get JWT token
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        session: null,
        token: null 
      }, { status: 401 })
    }

    // Get database user
    const dbUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        onboardingCompleted: true,
        onboardingCompletedAt: true,
        primaryGoals: true,
        biggestChallenges: true,
        skillLevel: true,
        subscriptionTier: true,
        isTrialActive: true,
      }
    })

    return NextResponse.json({ 
      timestamp: new Date().toISOString(),
      session: {
        userId: session.user.id,
        email: session.user.email,
        onboardingCompleted: session.user.onboardingCompleted,
      },
      jwtToken: {
        onboardingCompleted: token?.onboardingCompleted,
        lastRefresh: token?.lastRefresh ? new Date(token.lastRefresh as number).toISOString() : null,
      },
      database: dbUser,
      comparison: {
        sessionMatchesDB: session.user.onboardingCompleted === dbUser?.onboardingCompleted,
        jwtMatchesDB: token?.onboardingCompleted === dbUser?.onboardingCompleted,
        allMatch: session.user.onboardingCompleted === dbUser?.onboardingCompleted && 
                  token?.onboardingCompleted === dbUser?.onboardingCompleted
      }
    })
  } catch (error) {
    console.error('Error in debug/session:', error)
    return NextResponse.json({ 
      error: 'Failed to get debug info',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
