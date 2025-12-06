
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import ConnectPage from "@/components/pages/connect-page"

export default async function Connect() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/auth/signin")
  }

  // Get user data and potential practice partners
  const userData = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  // Get practice partners (mock data for now - would integrate with real matching system)
  const practicePartners = await prisma.player.findMany({
    where: {
      skillLevel: userData?.skillLevel || 'BEGINNER',
      isAvailable: true
    },
    orderBy: { lastSeen: 'desc' },
    take: 12
  })

  if (!userData) {
    redirect("/auth/signin")
  }

  return <ConnectPage user={userData} practicePartners={practicePartners} />
}
