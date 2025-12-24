import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import CourtKingsGame from "@/components/play/court-kings-game"

export const metadata = {
  title: "Court Kings | Mindful Champion",
  description: "Practice your pickleball skills with our fun Court Kings game",
}

export default async function PlayPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/signin")
  }

  return <CourtKingsGame />
}
