// @ts-nocheck

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma as db } from "@/lib/db"
import SignInForm from "@/components/auth/signin-form"
import Link from "next/link"

export default async function SignInPage() {
  const session = await getServerSession(authOptions)
  
  if (session?.user) {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { onboardingCompleted: true }
    })
    
    if (user?.onboardingCompleted) {
      redirect("/dashboard")
    } else {
      redirect("/onboarding")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="p-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">🏓</span>
          </div>
          <span className="text-xl font-bold text-white">Mindful Champion</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Hero Text */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
              Welcome Back, <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Champion</span> 🏓
            </h1>
            <p className="text-slate-300 text-lg">
              Your AI coach is ready when you are.
            </p>
          </div>
          
          {/* Sign In Form */}
          <SignInForm />
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center">
        <p className="text-slate-500 text-sm">
          © 2026 Mindful Champion. Level up your pickleball game.
        </p>
      </footer>
    </div>
  )
}
