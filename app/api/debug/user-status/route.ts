
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma as db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({
        authenticated: false,
        message: 'No session found'
      })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        onboardingCompleted: true,
        onboardingCompletedAt: true,
        skillLevel: true,
        primaryGoals: true,
        biggestChallenges: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      authenticated: true,
      session: {
        userId: session.user.id,
        email: session.user.email,
        name: session.user.name
      },
      databaseUser: user,
      recommendation: user?.onboardingCompleted 
        ? 'User should have access to dashboard'
        : 'User needs to complete onboarding'
    })

  } catch (error) {
    console.error('Error checking user status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
