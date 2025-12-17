
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma as db } from "@/lib/db"
import SignInForm from "@/components/auth/signin-form"
import PremiumIntroVideo from "@/components/intro/premium-intro-video"

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Premium Intro Video Section */}
      <div className="relative w-full">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <PremiumIntroVideo 
            variant="compact"
            autoPlay={true}
            className="rounded-2xl shadow-2xl ring-1 ring-white/10"
          />
        </div>
      </div>

      {/* Welcome Back Message */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="text-center mb-4">
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
            Welcome Back, Champion! 🏓
          </h1>
          <p className="text-base text-white/80">
            Continue your AI-powered pickleball journey
          </p>
        </div>
      </div>

      {/* Sign In Form Section */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="flex justify-center">
          <SignInForm />
        </div>
      </div>
    </div>
  )
}
