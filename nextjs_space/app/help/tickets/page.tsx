
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import MainNavigation from "@/components/navigation/main-navigation"
import MyTickets from "@/components/support/my-tickets"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { prisma } from "@/lib/db"

export default async function MyTicketsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/auth/signin")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  if (!user) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-champion-green/5 dark:from-champion-charcoal dark:via-gray-900 dark:to-champion-green/5">
      <MainNavigation user={user} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              My Tickets
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track your support requests and responses
            </p>
          </div>
          <Link href="/help/submit-ticket">
            <Button className="bg-gradient-to-r from-champion-green to-emerald-600">
              <Plus className="w-4 h-4 mr-2" />
              New Ticket
            </Button>
          </Link>
        </div>

        <MyTickets />
      </main>
    </div>
  )
}
