import { Suspense } from "react"
import { prisma } from "@/lib/db"
import { TournamentsHubClient } from "@/components/tournaments/tournaments-hub-client"
import { Loader2 } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function TournamentsPage() {
  // Fetch tournaments - no auth required to view
  const tournaments = await prisma.tournament.findMany({
    orderBy: {
      startDate: 'asc'
    },
    take: 50
  }).catch((error) => {
    console.error('Error fetching tournaments:', error)
    return [] // Return empty array on error
  })

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        </div>
      }
    >
      <TournamentsHubClient tournaments={tournaments} />
    </Suspense>
  )
}
