
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma as db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Step 1: Verify session
    const session = await getServerSession(authOptions)
    console.log('[Onboarding Goals API] Session check:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      hasUserId: !!session?.user?.id,
      userId: session?.user?.id
    })

    if (!session?.user?.id) {
      console.error('[Onboarding Goals API] No session or user ID')
      return NextResponse.json({ 
        error: 'Unauthorized - Please sign in again',
        details: 'Session validation failed'
      }, { status: 401 })
    }

    // Step 2: Parse request body
    let requestData
    try {
      requestData = await request.json()
      console.log('[Onboarding Goals API] Request data:', {
        hasGoals: !!requestData.goals,
        goalsCount: requestData.goals?.length || 0,
        hasChallenges: !!requestData.challenges,
        challengesCount: requestData.challenges?.length || 0,
        hasPreferences: !!requestData.preferences,
        coachingStyle: requestData.preferences?.coachingStyle,
        skillLevel: requestData.skillLevel
      })
    } catch (parseError) {
      console.error('[Onboarding Goals API] JSON parse error:', parseError)
      return NextResponse.json({
        error: 'Invalid request data',
        details: 'Could not parse JSON body'
      }, { status: 400 })
    }

    const { goals, skillLevel, challenges, preferences } = requestData

    // Step 3: Validate required data
    if (!goals || !Array.isArray(goals) || goals.length === 0) {
      console.error('[Onboarding Goals API] Invalid goals data:', goals)
      return NextResponse.json({
        error: 'Please select at least one goal',
        details: 'Goals array is required and must not be empty'
      }, { status: 400 })
    }

    if (!challenges || !Array.isArray(challenges) || challenges.length === 0) {
      console.error('[Onboarding Goals API] Invalid challenges data:', challenges)
      return NextResponse.json({
        error: 'Please select at least one challenge',
        details: 'Challenges array is required and must not be empty'
      }, { status: 400 })
    }

    if (!preferences?.coachingStyle) {
      console.error('[Onboarding Goals API] Missing coaching style')
      return NextResponse.json({
        error: 'Please select a coaching style',
        details: 'Coaching style preference is required'
      }, { status: 400 })
    }

    console.log('[Onboarding Goals API] Updating user:', session.user.id)

    // Step 4: Update user profile with goal-oriented data
    let updatedUser
    try {
      updatedUser = await db.user.update({
        where: { id: session.user.id },
        data: {
          primaryGoals: goals,
          biggestChallenges: challenges,
          skillLevel: skillLevel || 'BEGINNER',
          coachingStylePreference: preferences.coachingStyle,
          onboardingCompleted: true,
          onboardingCompletedAt: new Date(),
          updatedAt: new Date()
        }
      })
      console.log('[Onboarding Goals API] User updated successfully:', {
        userId: updatedUser.id,
        onboardingCompleted: updatedUser.onboardingCompleted,
        primaryGoalsCount: Array.isArray(updatedUser.primaryGoals) ? (updatedUser.primaryGoals as any[]).length : 0
      })
    } catch (dbError: any) {
      console.error('[Onboarding Goals API] Database update error:', {
        message: dbError.message,
        code: dbError.code,
        meta: dbError.meta
      })
      return NextResponse.json({
        error: 'Failed to save your goals',
        details: `Database error: ${dbError.message}`,
        help: 'Please try again or contact support if the issue persists'
      }, { status: 500 })
    }

    // Step 5: Revalidate pages (non-blocking)
    try {
      revalidatePath('/', 'layout')
      revalidatePath('/dashboard')
      revalidatePath('/onboarding')
      console.log('[Onboarding Goals API] Cache revalidated')
    } catch (revalidateError) {
      console.error('[Onboarding Goals API] Revalidation error (non-fatal):', revalidateError)
    }

    // Step 6: Generate program recommendations (non-blocking)
    let recommendedPrograms: any[] = []
    try {
      recommendedPrograms = await generateProgramRecommendations(goals, skillLevel, challenges)
      console.log('[Onboarding Goals API] Generated', recommendedPrograms.length, 'program recommendations')
    } catch (recommendError) {
      console.error('[Onboarding Goals API] Program recommendation error (non-fatal):', recommendError)
      // Continue without recommendations
    }

    // Step 7: Auto-enroll in program if user has single goal (non-blocking)
    if (goals.length === 1 && recommendedPrograms.length > 0) {
      const primaryProgram = recommendedPrograms[0]
      
      try {
        await db.userProgram.create({
          data: {
            userId: session.user.id,
            programId: primaryProgram.id,
            status: 'NOT_STARTED',
            currentDay: 1,
            completionPercentage: 0
          }
        })
        console.log('[Onboarding Goals API] Auto-enrolled user in program:', primaryProgram.id)
      } catch (programError) {
        console.error('[Onboarding Goals API] Auto-enrollment error (non-fatal):', programError)
      }
    }

    // Step 8: Return success response
    return NextResponse.json({
      success: true,
      message: 'Goals saved successfully!',
      user: {
        id: updatedUser.id,
        onboardingCompleted: updatedUser.onboardingCompleted,
        primaryGoals: updatedUser.primaryGoals,
        biggestChallenges: updatedUser.biggestChallenges,
        coachingStylePreference: updatedUser.coachingStylePreference
      },
      recommendedPrograms,
      nextStep: goals.length === 1 ? 'START_PROGRAM' : 'EXPLORE_PROGRAMS'
    })

  } catch (error: any) {
    console.error('[Onboarding Goals API] Unexpected error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return NextResponse.json({
      error: 'An unexpected error occurred',
      details: error.message || 'Unknown error',
      help: 'Please try again or contact support at support@mindfulchampion.com'
    }, { status: 500 })
  }
}

async function generateProgramRecommendations(goals: string[], skillLevel: string, challenges: string[]): Promise<any[]> {
  const programs = await db.trainingProgram.findMany({
    where: {
      isActive: true,
      skillLevel: skillLevel as any
    },
    orderBy: { createdAt: 'desc' }
  })

  // Simple matching logic - in production this could be more sophisticated
  const goalKeywords = {
    'improve-accuracy': ['accuracy', 'precision', 'control'],
    'build-consistency': ['consistency', 'fundamentals', 'basics'],
    'master-strategy': ['strategy', 'tactics', 'game', 'advanced'],
    'increase-speed': ['speed', 'power', 'athletic'],
    'mental-toughness': ['mental', 'focus', 'confidence'],
    'win-matches': ['competition', 'tournament', 'winning'],
    'specific-shots': ['serve', 'dink', 'volley', 'drop']
  }

  return programs.filter(program => {
    const programName = program.name.toLowerCase()
    const programDesc = program.description.toLowerCase()
    
    return goals.some(goal => {
      const keywords = goalKeywords[goal as keyof typeof goalKeywords] || [goal]
      return keywords.some(keyword => 
        programName.includes(keyword) || programDesc.includes(keyword)
      )
    })
  }).slice(0, 3) // Return top 3 matches
}
