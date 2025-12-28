
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import AvatarSetupClient from "@/components/avatar/avatar-setup-client"

export const dynamic = 'force-dynamic';

export default async function AvatarSetupPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/auth/signin")
  }

  const userData = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      subscriptionTier: true,
      avatarEnabled: true,
      avatarType: true,
      avatarPhotoUrl: true,
      avatarName: true,
      avatarVoiceEnabled: true,
      avatarCustomization: true,
    }
  })

  if (!userData) {
    redirect("/auth/signin")
  }

  // Check if user has Pro tier
  if (userData.subscriptionTier !== 'PRO') {
    redirect("/pricing")
  }

  return <AvatarSetupClient user={userData} />
}
