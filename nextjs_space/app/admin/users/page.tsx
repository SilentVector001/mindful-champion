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
    include: {
      SecurityLog: { orderBy: { createdAt: 'desc' }, take: 20 },
      Payment: { orderBy: { createdAt: 'desc' }, take: 5 },
      Match: { orderBy: { createdAt: 'desc' }, take: 10 },
      Goal: true,
      UserAchievement: true,
      VideoAnalysis: { orderBy: { createdAt: 'desc' }, take: 5 },
    }
  })

  const emailLogs = await prisma.emailLog.findMany({
    orderBy: { sentAt: 'desc' },
    take: 100
  })

  return <AdminUsersClient users={users} emailLogs={emailLogs} />
}
