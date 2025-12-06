
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma as db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { goals, skillLevel, challenges, preferences } = await request.json()

    console.log('Updating onboarding for user:', session.user.id)

    // Update user profile with goal-oriented data
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        primaryGoals: goals,
        biggestChallenges: challenges,
        skillLevel: skillLevel || 'BEGINNER',
        coachingStylePreference: preferences?.coachingStyle || 'BALANCED',
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
        updatedAt: new Date()
      }
    })

    console.log('Onboarding completed for user:', session.user.id, 'Status:', updatedUser.onboardingCompleted)

    // Aggressively revalidate all relevant pages to clear cache
    try {
      revalidatePath('/', 'layout') // Clear root layout cache
      revalidatePath('/dashboard')
      revalidatePath('/onboarding')
      revalidatePath('/auth/signin')
      revalidatePath('/auth/callback')
    } catch (revalidateError) {
      console.error('Revalidation error (non-fatal):', revalidateError)
    }

    // Generate personalized program recommendations based on goals
    const recommendedPrograms = await generateProgramRecommendations(goals, skillLevel, challenges)

    // Auto-enroll in most suitable program if user has clear focus
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
      } catch (programError) {
        console.error('Error creating user program (non-fatal):', programError)
        // Don't fail the whole request if program creation fails
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        onboardingCompleted: updatedUser.onboardingCompleted,
        primaryGoals: updatedUser.primaryGoals,
        biggestChallenges: updatedUser.biggestChallenges
      },
      recommendedPrograms,
      nextStep: goals.length === 1 ? 'START_PROGRAM' : 'EXPLORE_PROGRAMS'
    })

  } catch (error) {
    console.error('Error saving onboarding goals:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
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
