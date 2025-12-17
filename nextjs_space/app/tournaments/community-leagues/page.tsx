import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import MainNavigation from "@/components/navigation/main-navigation"
import { CommunityLeagues } from "@/components/tournaments/community-leagues"
import { prisma } from "@/lib/db"

export const metadata = {
  title: 'Community League Network | Mindful Champion',
  description: 'Grassroots team competitions - join local leagues and build your pickleball community',
}

export default async function CommunityLeaguesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/tournaments/community-leagues")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      firstName: true,
      lastName: true,
      email: true,
      image: true,
      skillLevel: true,
      rewardPoints: true,
      subscriptionTier: true,
      role: true,
    }
  })

  if (!user) {
    redirect("/auth/signin?callbackUrl=/tournaments/community-leagues")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <MainNavigation user={user} />
      <CommunityLeagues />
    </div>
  )
}
