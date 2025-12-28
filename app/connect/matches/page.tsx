
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import MatchesContent from "@/components/connect/matches-content"

export default async function MatchesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/auth/signin")
  }

  // Get user data including DUPR connection
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: {
      id: true,
      name: true,
      email: true,
      subscriptionTier: true,
      duprId: true,
      duprRating: true,
      duprConnected: true,
      skillLevel: true
    }
  })

  // Get user's matches
  const matches = await prisma.match.findMany({
    where: {
      OR: [
        { userId: user?.id },
        { opponentId: user?.id }
      ]
    },
    orderBy: { date: 'desc' },
    take: 50
  })

  return (
    <MatchesContent 
      user={user} 
      initialMatches={matches}
    />
  )
}
