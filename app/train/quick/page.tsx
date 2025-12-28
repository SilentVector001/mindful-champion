
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import MainNavigation from "@/components/navigation/main-navigation"
import QuickDrillsV2 from "@/components/train/quick-drills-v2"
import AvatarCoach from "@/components/avatar/avatar-coach"

export default async function QuickPage() {
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

  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'Champion'

  return (
    <div className="min-h-screen bg-white">
      <MainNavigation user={user} />
      <QuickDrillsV2 />
      <AvatarCoach userName={firstName} context="quick_drills" />
    </div>
  )
}
