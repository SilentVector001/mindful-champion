import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import MainNavigation from "@/components/navigation/main-navigation"
import { PickleballForPurpose } from "@/components/tournaments/pickleball-for-purpose"
import { prisma } from "@/lib/db"

export const metadata = {
  title: 'Pickleball for Purpose | Mindful Champion',
  description: 'Charity events and community tournaments - play with purpose and make a difference',
}

export default async function PickleballForPurposePage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/tournaments/pickleball-for-purpose")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      firstName: true,
      lastName: true,
      email: true,
      image: true,
      skillLevel: true,
      rewardPoints: true,
      subscriptionTier: true,
      role: true,
    }
  })

  if (!user) {
    redirect("/auth/signin?callbackUrl=/tournaments/pickleball-for-purpose")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <MainNavigation user={user} />
      <PickleballForPurpose />
    </div>
  )
}
