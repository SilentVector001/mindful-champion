import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { prisma } from "./db"

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
        console.log('[AUTH-MINIMAL] Authorize called with email:', credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log('[AUTH-MINIMAL] Missing credentials');
          return null;
        }

        // Use case-insensitive email lookup
        const user = await prisma.user.findFirst({
          where: { 
            email: {
              equals: credentials.email,
              mode: 'insensitive'
            }
          }
        })

        console.log('[AUTH-MINIMAL] User found:', !!user, 'Has password:', !!user?.password);
        
        if (!user || !user.password) {
          console.log('[AUTH-MINIMAL] User not found or no password');
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        console.log('[AUTH-MINIMAL] Password valid:', isPasswordValid);
        
        if (!isPasswordValid) {
          console.log('[AUTH-MINIMAL] Password mismatch for user:', user.email);
          return null
        }

        // Update lastActiveDate to current time
        await prisma.user.update({
          where: { id: user.id },
          data: { 
            lastActiveDate: new Date(),
            loginCount: { increment: 1 }
          }
        })

        console.log('[AUTH-MINIMAL] Login successful for user:', user.email);

        return {
          id: user.id,
          email: user.email,
          name: user.name || `${user.firstName} ${user.lastName}`,
          role: user.role,
          subscriptionTier: user.subscriptionTier,
          isTrialActive: user.isTrialActive,
          onboardingCompleted: user.onboardingCompleted,
          rewardPoints: user.rewardPoints || 0,
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
        token.rewardPoints = user.rewardPoints || 0
      }
      
      // Refresh user data periodically
      const shouldRefresh = trigger === 'update' || 
                           !token.lastRefresh || 
                           Date.now() - (token.lastRefresh as number) > 5000 || 
                           !token.onboardingCompleted
      
      if (shouldRefresh && token.sub) {
        const freshUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { 
            onboardingCompleted: true,
            role: true,
            subscriptionTier: true,
            isTrialActive: true,
            trialEndDate: true,
            rewardPoints: true
          }
        })
        if (freshUser) {
          token.onboardingCompleted = freshUser.onboardingCompleted
          token.role = freshUser.role
          token.subscriptionTier = freshUser.subscriptionTier
          token.isTrialActive = freshUser.isTrialActive
          token.trialEndDate = freshUser.trialEndDate?.toISOString()
          token.rewardPoints = freshUser.rewardPoints || 0
          token.lastRefresh = Date.now()
          
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
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.subscriptionTier = token.subscriptionTier as string
        session.user.isTrialActive = token.isTrialActive as boolean
        session.user.onboardingCompleted = token.onboardingCompleted as boolean
        session.user.trialEndDate = token.trialEndDate as string | undefined
        session.user.trialExpired = token.trialExpired as boolean | undefined
        session.user.rewardPoints = (token.rewardPoints as number) || 0
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  debug: process.env.NODE_ENV === "development",
}
// Force rebuild 1767461701
