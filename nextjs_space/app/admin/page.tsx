// @ts-nocheck

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import LiveAdminDashboard from '@/components/admin/live-admin-dashboard'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Check admin access
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, email: true }
  })

  // Allow access for admin role or owner email
  const isAdmin = user?.role === 'ADMIN' || user?.email === 'deansnow59@gmail.com'
  if (!isAdmin) {
    redirect('/dashboard')
  }

  // Get initial data
  const totalUsers = await prisma.user.count()
  const trialUsers = await prisma.user.count({
    where: { OR: [{ subscriptionTier: 'TRIAL' }, { isTrialActive: true }] }
  })
  const proUsers = await prisma.user.count({ where: { subscriptionTier: 'PRO' } })
  const premiumUsers = await prisma.user.count({ where: { subscriptionTier: 'PREMIUM' } })

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      id: true,
      email: true,
      name: true,
      firstName: true,
      lastName: true,
      createdAt: true,
      subscriptionTier: true,
      isTrialActive: true,
      trialEndsAt: true,
      role: true
    }
  })

  const estimatedRevenue = (proUsers * 19.99) + (premiumUsers * 49.99)

  const initialData = {
    stats: {
      totalUsers,
      trialUsers,
      proUsers,
      premiumUsers,
      totalRevenue: estimatedRevenue,
      userTrend: '+0 today',
      revenueTrend: `$${estimatedRevenue.toFixed(0)}/mo`
    },
    recentUsers
  }

  return <LiveAdminDashboard initialData={initialData} />
}
