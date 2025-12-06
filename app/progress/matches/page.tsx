
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { History } from "lucide-react"

export default async function MatchHistoryPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <History className="w-8 h-8 text-teal-600" />
            <h1 className="text-3xl font-bold text-slate-900">Match History</h1>
          </div>
          <p className="text-slate-600">Review past matches with scores and insights</p>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <History className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            <h3 className="text-xl font-semibold mb-2">Match history coming soon</h3>
            <p className="text-slate-600">
              View detailed records of all your past matches and performance.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
