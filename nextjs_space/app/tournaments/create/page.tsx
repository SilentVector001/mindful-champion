// @ts-nocheck
import { Suspense } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { CreateTournamentForm } from "@/components/tournaments/create-tournament-form"
import { Loader2 } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function CreateTournamentPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/auth/signin?callbackUrl=/tournaments/create')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 py-12">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
          </div>
        }
      >
        <CreateTournamentForm />
      </Suspense>
    </div>
  )
}
