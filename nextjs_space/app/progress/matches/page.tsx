// @ts-nocheck

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import MatchHistoryContent from "@/components/progress/match-history-content"
import MainNavigation from "@/components/navigation/main-navigation"

export default async function MatchHistoryPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/auth/signin")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      Match: {
        orderBy: { date: 'desc' },
        take: 50
      }
    }
  })

  if (!user) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <MainNavigation user={user} />
      <MatchHistoryContent user={user} matches={user.Match || []} />
    </div>
  )
}
