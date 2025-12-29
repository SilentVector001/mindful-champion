import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import MainNavigation from '@/components/navigation/main-navigation'
import { TournamentSeedInterface } from '@/components/admin/tournament-seed-interface'

export const metadata = {
  title: 'Seed Tournament Data | Admin',
  description: 'Seed the database with real tournament data',
}

export default async function TournamentSeedPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/admin/tournaments/seed')
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
      role: true,
      skillLevel: true,
      rewardPoints: true,
      subscriptionTier: true,
    }
  })

  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  // Get current tournament count
  const tournamentCount = await prisma.tournament.count()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <MainNavigation user={user} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <TournamentSeedInterface initialCount={tournamentCount} />
      </div>
    </div>
  )
}
