
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import MainNavigation from "@/components/navigation/main-navigation"
import SubmitTicketForm from "@/components/support/submit-ticket-form"
import { prisma } from "@/lib/db"

export default async function SubmitTicketPage() {
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Get Support
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Submit a ticket and our team will help you out
          </p>
        </div>

        <SubmitTicketForm />
      </main>
    </div>
  )
}
