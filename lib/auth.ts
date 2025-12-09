
import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { prisma } from "./db"
import {
  isAccountLocked,
  resetFailedAttempts,
  logSecurityEvent,
} from "./security"
// import { SecurityEventType, SecurityEventSeverity } from "@prisma/client"

// Temporary type definitions
const SecurityEventType = {
  IP_BLOCKED: 'IP_BLOCKED',
  IP_UNBLOCKED: 'IP_UNBLOCKED',
  FAILED_LOGIN: 'FAILED_LOGIN',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED: 'ACCOUNT_UNLOCKED',
  SUCCESSFUL_LOGIN: 'SUCCESSFUL_LOGIN',
  PASSWORD_RESET_REQUEST: 'PASSWORD_RESET_REQUEST',
  PASSWORD_RESET_COMPLETE: 'PASSWORD_RESET_COMPLETE',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
} as const;

const SecurityEventSeverity = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        // Use case-insensitive email lookup
        const user = await prisma.user.findFirst({
          where: { 
            email: {
              equals: credentials.email,
              mode: 'insensitive'
            }
          }
        })

        if (!user || !user.password) return null

        // Check if account is locked
        const locked = await isAccountLocked(user.id)
        if (locked) {
          await logSecurityEvent({
            userId: user.id,
            eventType: SecurityEventType.FAILED_LOGIN,
            severity: SecurityEventSeverity.HIGH,
            description: `Login attempt blocked - account is locked`,
          })
          throw new Error("Account is locked. Please contact support at security@mindfulchampion.com or info@mindfulchampion.com")
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          // Failed login will be tracked in the signin callback
          return null
        }

        // Reset failed attempts on successful login
        await resetFailedAttempts(user.id)

        // Update lastActiveDate to current time
        await prisma.user.update({
          where: { id: user.id },
          data: { lastActiveDate: new Date() }
        })

        // Log successful login
        await logSecurityEvent({
          userId: user.id,
          eventType: SecurityEventType.SUCCESSFUL_LOGIN,
          severity: SecurityEventSeverity.LOW,
          description: `User logged in successfully`,
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name || `${user.firstName} ${user.lastName}`,
          role: user.role,
          subscriptionTier: user.subscriptionTier,
          isTrialActive: user.isTrialActive,
          onboardingCompleted: user.onboardingCompleted,
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.role = user.role
        token.subscriptionTier = user.subscriptionTier
        token.isTrialActive = user.isTrialActive
        token.onboardingCompleted = user.onboardingCompleted
      }
      
      // CRITICAL FIX: Always refresh onboarding status to prevent redirect loops
      // Refresh user data on session update, or periodically (reduced to 5 seconds for onboarding)
      const shouldRefresh = trigger === 'update' || 
                           !token.lastRefresh || 
                           Date.now() - (token.lastRefresh as number) > 5000 || // 5 seconds instead of 60
                           !token.onboardingCompleted // Always refresh if onboarding not completed
      
      if (shouldRefresh && token.sub) {
        const freshUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { 
            onboardingCompleted: true,
            role: true,
            subscriptionTier: true,
            isTrialActive: true,
            trialEndDate: true
          }
        })
        if (freshUser) {
          token.onboardingCompleted = freshUser.onboardingCompleted
          token.role = freshUser.role
          token.subscriptionTier = freshUser.subscriptionTier
          token.isTrialActive = freshUser.isTrialActive
          token.trialEndDate = freshUser.trialEndDate?.toISOString()
          token.lastRefresh = Date.now()
          
          // Check if trial has expired
          if (freshUser.trialEndDate) {
            const now = new Date()
            const trialEnd = new Date(freshUser.trialEndDate)
            token.trialExpired = now > trialEnd
          }
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (token && session?.user) {
        session.user.id = token.sub as string
        session.user.role = token.role as string
        session.user.subscriptionTier = token.subscriptionTier as string
        session.user.isTrialActive = token.isTrialActive as boolean
        session.user.onboardingCompleted = token.onboardingCompleted as boolean
        session.user.trialEndDate = token.trialEndDate as string
        session.user.trialExpired = token.trialExpired as boolean
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/"  // Redirect to landing page (features) after sign out
  }
}
