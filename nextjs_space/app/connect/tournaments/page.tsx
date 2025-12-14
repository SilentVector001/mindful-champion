import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { TournamentHubEnhanced } from "@/components/tournaments/tournament-hub-enhanced"

export default async function TournamentsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/auth/signin")
  }

  return <TournamentHubEnhanced />
}