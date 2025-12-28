
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import GoalsContent from "@/components/goals/goals-content"
import MainNavigation from "@/components/navigation/main-navigation"

export default async function GoalsPage() {
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

  return (
    <>
      <MainNavigation user={user} />
      <GoalsContent user={user} />
    </>
  )
}
