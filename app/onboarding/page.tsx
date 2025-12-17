
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma as db } from '@/lib/db'
import GoalOrientedOnboarding from '@/components/onboarding/goal-oriented-onboarding'

export const dynamic = 'force-dynamic'
export const revalidate = 0 // Always fetch fresh data

export default async function OnboardingPage({ searchParams }: { searchParams: { update?: string } }) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  console.log('[Onboarding] User accessing onboarding:', session.user.id)

  // Check session first (faster, cached in JWT)
  if (session.user.onboardingCompleted && !searchParams.update) {
    console.log('[Onboarding] Session shows onboarding completed, redirecting to dashboard')
    redirect('/dashboard')
  }

  // Fetch fresh user data from database as backup
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { 
      onboardingCompleted: true,
      onboardingCompletedAt: true,
      skillLevel: true,
      primaryGoals: true,
      biggestChallenges: true,
      email: true
    }
  })

  console.log('[Onboarding] User status:', {
    id: session.user.id,
    email: user?.email,
    sessionOnboardingCompleted: session.user.onboardingCompleted,
    dbOnboardingCompleted: user?.onboardingCompleted,
    onboardingCompletedAt: user?.onboardingCompletedAt,
    isUpdateMode: !!searchParams.update
  })

  // Double-check with database - if completed and not updating, redirect
  if (user?.onboardingCompleted && !searchParams.update) {
    console.log('[Onboarding] Database shows onboarding completed, redirecting to dashboard')
    redirect('/dashboard')
  }

  console.log('[Onboarding] Allowing access to onboarding page')

  return (
    <div className="min-h-screen bg-gradient-to-br from-champion-green/10 via-white to-champion-blue/10">
      <GoalOrientedOnboarding 
        user={session.user}
        isUpdating={user?.onboardingCompleted || false}
      />
    </div>
  )
}
