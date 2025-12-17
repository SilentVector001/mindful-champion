export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    
    // Sign-up counts
    const [
      signupsToday,
      signupsThisWeek,
      signupsThisMonth,
      signupsTotal,
    ] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.user.count({ where: { createdAt: { gte: startOfWeek } } }),
      prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.user.count(),
    ])

    // Revenue calculations
    const [
      revenueToday,
      revenueThisWeek,
      revenueThisMonth,
      revenueThisYear,
      revenueTotal,
    ] = await Promise.all([
      prisma.payment.aggregate({
        where: { createdAt: { gte: startOfToday }, status: 'SUCCEEDED' },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { createdAt: { gte: startOfWeek }, status: 'SUCCEEDED' },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { createdAt: { gte: startOfMonth }, status: 'SUCCEEDED' },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { createdAt: { gte: startOfYear }, status: 'SUCCEEDED' },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { status: 'SUCCEEDED' },
        _sum: { amount: true },
      }),
    ])

    // Subscription breakdown
    const [
      freeUsers,
      premiumUsers,
      proUsers,
      trialUsers,
      activeSubscriptions,
    ] = await Promise.all([
      prisma.user.count({ where: { subscriptionTier: 'FREE', isTrialActive: false } }),
      prisma.user.count({ where: { subscriptionTier: 'PREMIUM' } }),
      prisma.user.count({ where: { subscriptionTier: 'PRO' } }),
      prisma.user.count({ where: { isTrialActive: true } }),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    ])

    // Recent payments (last 10)
    const recentPayments = await prisma.payment.findMany({
      where: { status: 'SUCCEEDED' },
      include: { user: { select: { email: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    // Monthly revenue trend (last 12 months)
    const monthlyRevenue = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        SUM(amount) as total
      FROM "Payment"
      WHERE status = 'SUCCEEDED'
        AND "createdAt" >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month DESC
      LIMIT 12
    ` as any[]

    // Daily signups for the last 7 days
    const dailySignups = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('day', "createdAt") as day,
        COUNT(*) as count
      FROM "User"
      WHERE "createdAt" >= NOW() - INTERVAL '7 days'
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY day DESC
    ` as any[]

    // MRR calculation (Monthly Recurring Revenue)
    // Count active subscriptions by tier and multiply by tier price
    const premiumMRR = premiumUsers * 9.99  // $9.99/month
    const proMRR = proUsers * 19.99  // $19.99/month
    const totalMRR = premiumMRR + proMRR

    // Churn rate (users who cancelled in last 30 days)
    const cancelledLast30Days = await prisma.subscription.count({
      where: {
        status: 'CANCELED',
        updatedAt: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
      },
    })
    
    const churnRate = activeSubscriptions > 0 
      ? ((cancelledLast30Days / (activeSubscriptions + cancelledLast30Days)) * 100).toFixed(2)
      : '0.00'

    return NextResponse.json({
      signups: {
        today: signupsToday,
        thisWeek: signupsThisWeek,
        thisMonth: signupsThisMonth,
        total: signupsTotal,
      },
      revenue: {
        today: (revenueToday._sum.amount || 0) / 100,
        thisWeek: (revenueThisWeek._sum.amount || 0) / 100,
        thisMonth: (revenueThisMonth._sum.amount || 0) / 100,
        thisYear: (revenueThisYear._sum.amount || 0) / 100,
        total: (revenueTotal._sum.amount || 0) / 100,
      },
      subscriptions: {
        free: freeUsers,
        premium: premiumUsers,
        pro: proUsers,
        trial: trialUsers,
        active: activeSubscriptions,
        total: freeUsers + premiumUsers + proUsers + trialUsers,
      },
      metrics: {
        mrr: totalMRR,
        arr: totalMRR * 12,
        churnRate: parseFloat(churnRate),
        conversionRate: signupsTotal > 0 
          ? (((premiumUsers + proUsers) / signupsTotal) * 100).toFixed(2)
          : '0.00',
      },
      recentPayments: recentPayments.map(p => ({
        id: p.id,
        amount: p.amount / 100,
        tier: p.subscriptionTier,
        email: p.user?.email || 'Unknown',
        name: p.user?.firstName && p.user?.lastName 
          ? `${p.user.firstName} ${p.user.lastName}` 
          : p.user?.email?.split('@')[0] || 'Unknown',
        createdAt: p.createdAt,
      })),
      trends: {
        monthlyRevenue: monthlyRevenue.map((r: any) => ({
          month: r.month,
          total: Number(r.total) / 100,
        })),
        dailySignups: dailySignups.map((s: any) => ({
          day: s.day,
          count: Number(s.count),
        })),
      },
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Admin revenue analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch revenue data" }, { status: 500 })
  }
}
