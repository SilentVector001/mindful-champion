import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminDrillsManager from "@/components/admin/admin-drills-manager"

export default async function AdminDrillsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session?.user?.role !== "ADMIN") {
    redirect("/dashboard")
  }

  // Fetch drill statistics
  const totalDrills = await prisma.drill.count({ where: { active: true } })
  const featuredDrills = await prisma.drill.count({ where: { featured: true, active: true } })
  const categoryCounts = await prisma.drill.groupBy({
    by: ['category'],
    where: { active: true },
    _count: true
  })

  const stats = {
    totalDrills,
    featuredDrills,
    categoryCounts: categoryCounts?.map(c => ({
      category: c?.category ?? '',
      count: c?._count ?? 0
    })) ?? []
  }

  return <AdminDrillsManager stats={stats} />
}
