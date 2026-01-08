// @ts-nocheck
import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { TournamentDetailClient } from "@/components/tournaments/tournament-detail-client"
import { Loader2 } from "lucide-react"

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { id: string }
}

export default async function TournamentDetailPage({ params }: PageProps) {
  const { id } = params

  // Get tournament data
  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      registrations: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              skillLevel: true
            }
          }
        },
        orderBy: {
          registeredAt: 'asc'
        }
      },
      matches: {
        orderBy: [
          { roundNumber: 'asc' },
          { matchNumber: 'asc' }
        ]
      }
    }
  })

  if (!tournament) {
    notFound()
  }

  // Get user session
  const session = await getServerSession(authOptions)
  const userEmail = session?.user?.email

  // Check if user is registered
  const userRegistration = userEmail
    ? tournament.registrations?.find((reg) => reg.user?.email === userEmail)
    : null

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        </div>
      }
    >
      <TournamentDetailClient
        tournament={tournament}
        userRegistration={userRegistration ?? null}
        isLoggedIn={!!userEmail}
      />
    </Suspense>
  )
}
