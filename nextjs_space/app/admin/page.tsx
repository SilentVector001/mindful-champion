// @ts-nocheck

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import StreamlinedAdmin from "@/components/admin/streamlined-admin"

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect("/dashboard")
  }

  // Get comprehensive admin data - optimized to reduce concurrent connections
  // Fetch critical data first
  const users = await prisma.user.count()
  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      subscriptionTier: true,
      isTrialActive: true,
      Subscription: {
        where: { status: 'ACTIVE' },
        select: { id: true }
      }
    }
  })
  
  // Fetch secondary data in smaller batches
  const [payments, matches, recentUsers] = await Promise.all([
    prisma.payment.findMany({
      include: { User: { select: { id: true, name: true, firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20
    }),
    prisma.match.count(),
    prisma.user.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
        subscriptionTier: true,
        isTrialActive: true
      }
    })
  ])
  
  // Calculate previous period data (simplified to reduce queries)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const previousUsers = await prisma.user.count({
    where: { createdAt: { lt: thirtyDaysAgo } }
  })
  const previousPaymentsSum = await prisma.payment.aggregate({
    where: { createdAt: { lt: thirtyDaysAgo } },
    _sum: { amount: true }
  })
  const previousMatches = await prisma.match.count({
    where: { createdAt: { lt: thirtyDaysAgo } }
  })
  
  const previousRevenue = previousPaymentsSum._sum.amount || 0

  // Calculate revenue
  const totalRevenue = payments.reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0)
  const monthlyRevenue = payments
    .filter((p: any) => new Date(p.createdAt) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    .reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0)

  // Properly categorize users (no overlaps)
  // Priority: PRO > PREMIUM > TRIAL > FREE
  let proUsers = 0
  let premiumUsers = 0
  let trialUsers = 0
  let freeUsers = 0
  let activeSubscriptions = 0

  allUsers.forEach((user: any) => {
    // Count active subscriptions (users paying for Premium or Pro)
    if ((user.subscriptionTier === 'PREMIUM' || user.subscriptionTier === 'PRO') && !user.isTrialActive) {
      activeSubscriptions++
    }

    // Categorize users with priority order
    if (user.subscriptionTier === 'PRO') {
      proUsers++
    } else if (user.subscriptionTier === 'PREMIUM') {
      premiumUsers++
    } else if (user.isTrialActive) {
      trialUsers++
    } else {
      freeUsers++
    }
  })

  // Calculate percentage changes
  const calculatePercentChange = (current: number, previous: number): string => {
    if (previous === 0) {
      return current > 0 ? '+100%' : '0%'
    }
    const change = ((current - previous) / previous) * 100
    return change >= 0 ? `+${Math.round(change)}%` : `${Math.round(change)}%`
  }

  const userTrend = calculatePercentChange(users, previousUsers)
  const revenueTrend = calculatePercentChange(totalRevenue, previousRevenue)
  const matchesTrend = calculatePercentChange(matches, previousMatches)

  // Fetch email notifications (email logs)
  let emailLogs: any[] = []
  try {
    emailLogs = await prisma.emailNotification.findMany({
      orderBy: { sentAt: 'desc' },
      take: 50,
      select: {
        id: true,
        type: true,
        status: true,
        sentAt: true,
        userId: true,
        metadata: true
      }
    })
  } catch (e) {
    console.error('Failed to fetch email logs:', e)
  }

  const adminData = {
    stats: {
      totalUsers: users,
      activeSubscriptions,
      totalRevenue: totalRevenue / 100,
      monthlyRevenue: monthlyRevenue / 100,
      totalMatches: matches,
      trialUsers,
      freeUsers,
      premiumUsers,
      proUsers,
      userTrend,
      revenueTrend,
      matchesTrend,
      subscriptionTrend: calculatePercentChange(activeSubscriptions, 0),
    },
    recentUsers,
    payments: payments.slice(0, 10),
    emailLogs,
    conversionRate: users > 0 ? ((premiumUsers + proUsers) / users * 100) : 0
  }

  return <StreamlinedAdmin initialData={adminData} />
}
// Rebuild 1767916612
