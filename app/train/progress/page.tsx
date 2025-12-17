

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import MainNavigation from "@/components/navigation/main-navigation"
import PremiumTrainingPrograms from "@/components/train/premium-training-programs"
import AvatarCoach from "@/components/avatar/avatar-coach"

export default async function TrainingProgressPage() {
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

  // Get available training programs
  const programsData = await prisma.trainingProgram.findMany({
    where: { isActive: true },
    select: {
      id: true,
      programId: true,
      name: true,
      tagline: true,
      description: true,
      durationDays: true,
      skillLevel: true,
      estimatedTimePerDay: true,
      keyOutcomes: true,
      isActive: true
    }
  })

  // Transform to match expected type
  const programs = programsData.map(p => ({
    ...p,
    keyOutcomes: Array.isArray(p.keyOutcomes) ? p.keyOutcomes as string[] : undefined
  }))

  // Get user's enrolled programs with detailed progress
  const userProgramsData = await prisma.userProgram.findMany({
    where: { userId: session.user.id },
    include: {
      program: {
        select: {
          id: true,
          programId: true,
          name: true,
          tagline: true,
          description: true,
          durationDays: true,
          skillLevel: true,
          estimatedTimePerDay: true,
          keyOutcomes: true,
          isActive: true
        }
      }
    }
  })

  // Transform user programs to include additional metrics and proper typing
  const enrichedUserPrograms = userProgramsData.map(up => ({
    ...up,
    program: {
      ...up.program,
      keyOutcomes: Array.isArray(up.program.keyOutcomes) ? up.program.keyOutcomes as string[] : undefined
    },
    streakDays: Math.floor(Math.random() * 7) + 1, // TODO: Calculate actual streak
    lastActivityDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // TODO: Get actual last activity
    completedDays: Array.from({ length: up.currentDay - 1 }, (_, i) => i + 1) // TODO: Get actual completed days
  }))

  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'Champion'

  return (
    <div className="min-h-screen">
      <MainNavigation user={user} />
      
      <main>
        <PremiumTrainingPrograms
          user={user}
          programs={programs}
          userPrograms={enrichedUserPrograms}
        />
      </main>

      <AvatarCoach userName={firstName} context="training_progress" />
    </div>
  )
}
