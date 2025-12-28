import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import UserDetailView from "@/components/admin/user-detail-view"

interface PageProps {
  params: {
    userId: string
  }
}

export default async function UserDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect("/dashboard")
  }

  return <UserDetailView userId={params.userId} />
}
