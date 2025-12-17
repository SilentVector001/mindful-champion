
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import SimplifiedSettingsPage from "@/components/pages/simplified-settings-page"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/auth/signin")
  }

  const userData = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  if (!userData) {
    redirect("/auth/signin")
  }

  return <SimplifiedSettingsPage user={userData} />
}
