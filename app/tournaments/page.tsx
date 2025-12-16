import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import MainNavigation from "@/components/navigation/main-navigation"
import { TournamentDiscovery } from "@/components/tournaments/tournament-discovery"
import { prisma } from "@/lib/db"

export const metadata = {
  title: 'Find Your Next Tournament | Mindful Champion',
  description: 'Discover pickleball tournaments across the nation. Search by location, skill level, and format. Compete at your level and elevate your game.',
}

export default async function TournamentsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/tournaments")
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
    redirect("/auth/signin?callbackUrl=/tournaments")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <MainNavigation user={user} />
      <TournamentDiscovery />
    </div>
  )
}
