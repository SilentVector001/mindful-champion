
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma as db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

/**
 * Force Complete Onboarding Endpoint
 * 
 * This is a bypass mechanism for users stuck in onboarding redirect loops.
 * It ensures the database is set to onboardingCompleted = true and clears all relevant caches.
 * 
 * Usage: POST to /api/auth/force-complete-onboarding
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[Force Complete] Forcing onboarding completion for user:', session.user.id)

    // Fetch current user state
    const userBefore = await db.user.findUnique({
      where: { id: session.user.id },
      select: { 
        email: true,
        onboardingCompleted: true,
        onboardingCompletedAt: true
      }
    })

    console.log('[Force Complete] User state before:', userBefore)

    // Force onboarding to be completed
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
        updatedAt: new Date()
      }
    })

    console.log('[Force Complete] User state after:', {
      email: updatedUser.email,
      onboardingCompleted: updatedUser.onboardingCompleted,
      onboardingCompletedAt: updatedUser.onboardingCompletedAt
    })

    // Aggressively clear all caches
    console.log('[Force Complete] Revalidating all paths')
    try {
      revalidatePath('/', 'layout')
      revalidatePath('/dashboard')
      revalidatePath('/onboarding')
      revalidatePath('/auth/signin')
      revalidatePath('/auth/callback')
    } catch (revalidateError) {
      console.error('[Force Complete] Revalidation error (non-fatal):', revalidateError)
    }

    return NextResponse.json({
      success: true,
      message: 'Onboarding status force-completed successfully. Please refresh your browser.',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        onboardingCompleted: updatedUser.onboardingCompleted,
        onboardingCompletedAt: updatedUser.onboardingCompletedAt
      },
      instructions: [
        '1. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)',
        '2. Navigate to /dashboard',
        '3. If still stuck, clear browser cookies and log in again'
      ]
    })

  } catch (error) {
    console.error('[Force Complete] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to force-complete onboarding',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check current onboarding status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
        biggestChallenges: true
      }
    })

    return NextResponse.json({
      user,
      sessionData: {
        userId: session.user.id,
        userEmail: session.user.email
      }
    })

  } catch (error) {
    console.error('[Force Complete] GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user status' },
      { status: 500 }
    )
  }
}
