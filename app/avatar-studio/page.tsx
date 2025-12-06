
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles } from "lucide-react"
import MainNavigation from "@/components/navigation/main-navigation"

export default async function AvatarStudioPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/auth/signin")
  }

  // Get user data for navigation
  const userData = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  if (!userData) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50">
      <MainNavigation user={userData} />
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-slate-900">Avatar Studio</h1>
          </div>
          <p className="text-slate-600">Customize your AI coach's appearance and personality</p>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            <h3 className="text-xl font-semibold mb-2">Avatar Studio coming soon</h3>
            <p className="text-slate-600">
              Customize your AI coach's voice, appearance, and coaching style.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
