import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import MainNavigation from "@/components/navigation/main-navigation"
import { TournamentCalendar } from "@/components/tournaments/tournament-calendar"
import { prisma } from "@/lib/db"

export const metadata = {
  title: 'Event Calendar | Mindful Champion',
  description: 'Interactive tournament calendar with map view - find events near you or across the nation',
}

export default async function CalendarPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/tournaments/calendar")
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
    redirect("/auth/signin?callbackUrl=/tournaments/calendar")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <MainNavigation user={user} />
      <TournamentCalendar />
    </div>
  )
}
