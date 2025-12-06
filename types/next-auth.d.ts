
import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: string
      subscriptionTier: string
      isTrialActive: boolean
      onboardingCompleted?: boolean
      trialEndDate?: string | null
      trialExpired?: boolean
    }
  }

  interface User {
    role: string
    subscriptionTier: string
    isTrialActive: boolean
    onboardingCompleted?: boolean
    trialEndDate?: string | null
    trialExpired?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    subscriptionTier: string
    isTrialActive: boolean
    onboardingCompleted?: boolean
    trialEndDate?: string | null
    trialExpired?: boolean
  }
}
