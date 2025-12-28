
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import MainNavigation from "@/components/navigation/main-navigation"
import MyPartnerRequests from "@/components/connect/my-partner-requests"
import AvatarCoach from "@/components/avatar/avatar-coach"

export default async function MyRequestsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/auth/signin")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      firstName: true,
      email: true,
      skillLevel: true,
      playerRating: true,
      subscriptionTier: true,
      avatarEnabled: true,
      avatarType: true,
      avatarPhotoUrl: true,
      avatarName: true,
    }
  })

  if (!user) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 dark:from-champion-charcoal dark:to-slate-900">
      <MainNavigation user={user} />
      
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent mb-3">
            My Partner Requests 📬
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Manage your sent and received practice partner requests. Build your network!
          </p>
        </div>

        <MyPartnerRequests user={user} />
      </div>

      <AvatarCoach 
        userName={user.firstName || user.name?.split(' ')[0] || 'Champion'} 
        context="requests" 
      />
    </div>
  )
}
