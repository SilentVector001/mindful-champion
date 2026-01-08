// @ts-nocheck
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { TournamentDiscovery } from "@/components/tournaments/tournament-discovery"

export default async function TournamentsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/auth/signin")
  }

  return <TournamentDiscovery />
}