import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import MainNavigation from "@/components/navigation/main-navigation"
import { RisingStars } from "@/components/tournaments/rising-stars"
import { prisma } from "@/lib/db"

export const metadata = {
  title: 'Rising Stars Program | Mindful Champion',
  description: 'Junior pickleball development programs - nurturing the next generation of champions',
}

export default async function RisingStarsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/tournaments/rising-stars")
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
    redirect("/auth/signin?callbackUrl=/tournaments/rising-stars")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <MainNavigation user={user} />
      <RisingStars />
    </div>
  )
}
