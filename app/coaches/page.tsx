
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import MainNavigation from "@/components/navigation/main-navigation"
import PartnerMarketplace from "@/components/partners/partner-marketplace"

export default async function CoachesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/auth/signin")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      firstName: true,
      email: true,
      skillLevel: true,
      subscriptionTier: true,
      avatarEnabled: true,
      avatarPhotoUrl: true,
      avatarName: true,
    }
  })

  if (!user) {
    redirect("/auth/signin")
  }

  // Fetch all active partners with their services
  const partners = await prisma.partner.findMany({
    where: {
      status: 'ACTIVE',
    },
    include: {
      services: {
        where: { isActive: true },
        orderBy: { order: 'asc' }
      },
      reviews: {
        take: 5,
        orderBy: { createdAt: 'desc' }
      }
    },
    orderBy: [
      { featured: 'desc' },
      { rating: 'desc' },
      { order: 'asc' }
    ]
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 dark:from-champion-charcoal dark:to-slate-900">
      <MainNavigation user={user} />
      
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <PartnerMarketplace 
          partners={partners} 
          user={user}
        />
      </div>
    </div>
  )
}
