import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import MainNavigation from "@/components/navigation/main-navigation"
import PartnersContent from "@/components/connect/partners-content"
import AvatarCoach from "@/components/avatar/avatar-coach"

export default async function FindPartnersPage() {
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
      playerRating: true,
      location: true,
      primaryGoals: true,
      coachingStylePreference: true,
      preferredDays: true,
      subscriptionTier: true,
      avatarEnabled: true,
      avatarType: true,
      avatarPhotoUrl: true,
      avatarName: true,
    }
  })

  if (!user) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 dark:from-champion-charcoal dark:to-slate-900">
      <MainNavigation user={user} />
      
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent mb-3">
            Find Your Perfect Practice Partner 🤝
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Connect with players who match your skill level, goals, and playing style. 
            Train smarter together and accelerate your improvement.
          </p>
        </div>

        <PartnersContent user={user} initialPartners={[]} />
      </div>

      <AvatarCoach 
        userName={user.firstName || user.name?.split(' ')[0] || 'Champion'} 
        context="partners" 
      />
    </div>
  )
}
