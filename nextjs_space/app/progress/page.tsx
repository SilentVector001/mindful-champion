// @ts-nocheck

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import EnhancedProgressPage from "@/components/pages/enhanced-progress-page"

export default async function Progress() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/auth/signin")
  }

  // Get user data with performance metrics
  const userData = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      Match: {
        orderBy: { date: 'desc' },
        take: 20
      },
      TrainingPlan: {
        orderBy: { createdAt: 'desc' },
        take: 10
      },
      MentalSession: {
        orderBy: { createdAt: 'desc' },
        take: 10
      },
      Goal: {
        include: { Milestone: true },
        orderBy: { createdAt: 'desc' }
      },
      UserAchievement: {
        include: { Achievement: true }
      }
    }
  })

  if (!userData) {
    redirect("/auth/signin")
  }

  return <EnhancedProgressPage user={userData} />
}
