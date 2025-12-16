
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma as db } from "@/lib/db"
import SignInForm from "@/components/auth/signin-form"

export default async function SignInPage() {
  const session = await getServerSession(authOptions)
  
  if (session?.user) {
    console.log('[SignIn] User already logged in, checking onboarding status:', session.user.id)
    
    // Check if user has completed onboarding
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { 
        onboardingCompleted: true,
        onboardingCompletedAt: true,
        email: true 
      }
    })
    
    console.log('[SignIn] User onboarding check:', {
      id: session.user.id,
      email: user?.email,
      onboardingCompleted: user?.onboardingCompleted,
      onboardingCompletedAt: user?.onboardingCompletedAt
    })
    
    // Redirect to appropriate page based on onboarding status
    if (user?.onboardingCompleted) {
      console.log('[SignIn] Redirecting to /dashboard')
      redirect("/dashboard")
    } else {
      console.log('[SignIn] Redirecting to /onboarding')
      redirect("/onboarding")
    }
  }
  
  console.log('[SignIn] No session, showing signin form')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Welcome Back Message */}
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
            Welcome Back, Champion! 🏓
          </h1>
          <p className="text-lg text-white/80">
            Continue your AI-powered pickleball journey
          </p>
        </div>

        {/* Sign In Form Section */}
        <div className="flex justify-center">
          <SignInForm />
        </div>
      </div>
    </div>
  )
}
