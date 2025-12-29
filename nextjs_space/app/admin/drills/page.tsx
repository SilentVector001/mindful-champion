import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import AdminDrillsManager from "@/components/admin/admin-drills-manager"
import { drillsDatabase, getFeaturedDrills } from "@/lib/drills-data"

export default async function AdminDrillsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session?.user?.role !== "ADMIN") {
    redirect("/dashboard")
  }

  // Fetch drill statistics from static data
  const totalDrills = drillsDatabase.length
  const featuredDrills = getFeaturedDrills(20).length
  
  // Calculate category counts
  const categoryCountsMap = drillsDatabase.reduce((acc, drill) => {
    acc[drill.category] = (acc[drill.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const categoryCounts = Object.entries(categoryCountsMap).map(([category, count]) => ({
    category,
    count
  }))

  const stats = {
    totalDrills,
    featuredDrills,
    categoryCounts
  }

  return <AdminDrillsManager stats={stats} />
}
