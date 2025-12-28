import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import SimpleCoachKai from "@/components/coach/simple-coach-kai"
import MainNavigation from "@/components/navigation/main-navigation"

export default async function AICoachPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/auth/signin")
  }

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
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <MainNavigation user={userData} />
      <div className="pt-16">
        <SimpleCoachKai userContext={userContext} />
      </div>
    </div>
  )
}
