// @ts-nocheck
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import AdminUsersClient from "./admin-users-client"

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect("/dashboard")
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      skillLevel: true,
      playerRating: true,
      subscriptionTier: true,
      subscriptionStatus: true,
      isTrialActive: true,
      trialEndDate: true,
      createdAt: true,
      lastActiveDate: true,
      loginCount: true,
      welcomeEmailSent: true,
      welcomeEmailSentAt: true,
      totalMatches: true,
      totalWins: true,
      currentStreak: true,
      _count: {
        select: {
          Match: true,
          Goal: true,
          UserAchievement: true,
          Payment: true,
          SecurityLog: true,
        }
      }
    }
  })

  let emailLogs: any[] = []
  try {
    emailLogs = await prisma.emailNotification.findMany({
      orderBy: { sentAt: 'desc' },
      take: 100,
      select: {
        id: true,
        type: true,
        status: true,
        sentAt: true,
        userId: true
      }
    })
  } catch (e) {
    console.error('Failed to fetch email logs:', e)
  }

  return <AdminUsersClient users={users} emailLogs={emailLogs} />
}
