
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import SignUpForm from "@/components/auth/signup-form"

export default async function SignUpPage() {
  const session = await getServerSession(authOptions)
  
  if (session?.user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-orange-50 p-4">
      <SignUpForm />
    </div>
  )
}
