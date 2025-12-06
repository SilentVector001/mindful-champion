
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import PTTAICoach from "@/components/coach/ptt-ai-coach"
import MainNavigation from "@/components/navigation/main-navigation"

export default async function AICoachPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/auth/signin")
  }

  // Get user data with comprehensive context for Coach Kai
  const userData = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      matches: {
        orderBy: { date: 'desc' },
        take: 5
      },
      mentalSessions: {
        orderBy: { createdAt: 'desc' },
        take: 3
      }
    }
  })

  if (!userData) {
    redirect("/auth/signin")
  }

  // Build comprehensive user context for AI - ensuring consistent data
  const userContext = {
    name: userData.name || userData.firstName || 'Champion',
    firstName: userData.firstName || userData.name?.split(' ')[0] || 'Champion',
    email: userData.email,
    skillLevel: userData.skillLevel || 'Beginner',
    playerRating: userData.playerRating ? parseFloat(userData.playerRating.toString()) : 0.0,
    primaryGoals: Array.isArray(userData.primaryGoals) 
      ? userData.primaryGoals as string[]
      : typeof userData.primaryGoals === 'string' 
        ? userData.primaryGoals.split(',').map(g => g.trim())
        : ['Improve overall game'],
    biggestChallenges: Array.isArray(userData.biggestChallenges) 
      ? userData.biggestChallenges as string[]
      : typeof userData.biggestChallenges === 'string' 
        ? userData.biggestChallenges.split(',').map(c => c.trim())
        : ['Developing consistency'],
    recentMatches: userData.matches?.length || 0,
    sessionCount: userData.mentalSessions?.length || 0,
    subscriptionTier: userData.subscriptionTier || 'FREE',
    role: userData.role
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50">
      <MainNavigation user={userData} />
      <div className="pt-16"> {/* Add padding-top to prevent navigation overlap */}
        <PTTAICoach userContext={userContext} />
      </div>
    </div>
  )
}
