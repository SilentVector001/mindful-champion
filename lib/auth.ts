import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { prisma } from "./db"

export const authOptions: NextAuthOptions = {
  // Note: PrismaAdapter is commented out because it conflicts with CredentialsProvider
  // The adapter tries to enforce OAuth account linking which breaks credentials-based login
  // adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  // Allow email account linking to prevent OAuthAccountNotLinked errors
  // This is safe because we're only using CredentialsProvider currently
  allowDangerousEmailAccountLinking: true,
  trustHost: true, // Required for custom domains in production
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('[AUTH] ====== AUTHORIZE START ======');
        console.log('[AUTH] Timestamp:', new Date().toISOString());
        console.log('[AUTH] DATABASE_URL exists:', !!process.env.DATABASE_URL);
        console.log('[AUTH] DATABASE_URL prefix:', process.env.DATABASE_URL?.substring(0, 30) + '...');
        console.log('[AUTH] NEXTAUTH_SECRET exists:', !!process.env.NEXTAUTH_SECRET);
        console.log('[AUTH] Email received:', credentials?.email);
        
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log('[AUTH] FAIL: Missing email or password');
            return null;
          }

          console.log('[AUTH] Step 1: Looking up user in database...');
          const normalizedEmail = credentials.email.toLowerCase().trim();
          console.log('[AUTH] Normalized email:', normalizedEmail);
          
          const user = await prisma.user.findFirst({
            where: { 
              email: {
                equals: normalizedEmail,
                mode: 'insensitive'
              }
            },
            select: {
              id: true,
              email: true,
              name: true,
              firstName: true,
              lastName: true,
              password: true,
              role: true,
              subscriptionTier: true,
              isTrialActive: true,
              onboardingCompleted: true,
              rewardPoints: true
            }
          });

          console.log('[AUTH] User found:', !!user);
          console.log('[AUTH] User ID:', user?.id || 'N/A');
          console.log('[AUTH] User has password hash:', !!user?.password);
          console.log('[AUTH] Password hash length:', user?.password?.length || 0);
          
          if (!user) {
            console.log('[AUTH] FAIL: No user found with email:', credentials.email);
            return null;
          }
          
          if (!user.password) {
            console.log('[AUTH] FAIL: User exists but has no password (OAuth only?)');
            return null;
          }

          console.log('[AUTH] Step 2: Validating password with bcrypt...');
          console.log('[AUTH] Provided password length:', credentials.password.length);
          console.log('[AUTH] Hash starts with $2:', user.password.startsWith('$2'));
          
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          console.log('[AUTH] Password validation result:', isPasswordValid);
          console.log('[AUTH] bcrypt.compare completed without error');
          
          if (!isPasswordValid) {
            console.log('[AUTH] FAIL: Invalid password');
            return null;
          }

          console.log('[AUTH] Step 3: Updating user activity...');
          await prisma.user.update({
            where: { id: user.id },
            data: { 
              lastActiveDate: new Date(),
              loginCount: { increment: 1 }
            }
          });

          console.log('[AUTH] SUCCESS: Login completed for:', user.email);
          console.log('[AUTH] ====== AUTHORIZE END ======');

          return {
            id: user.id,
            email: user.email,
            name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
            role: user.role,
            subscriptionTier: user.subscriptionTier,
            isTrialActive: user.isTrialActive,
            onboardingCompleted: user.onboardingCompleted,
            rewardPoints: user.rewardPoints || 0,
          };
        } catch (error) {
          console.log('[AUTH] EXCEPTION:');
          console.log('[AUTH] Error:', (error as Error).message);
          console.log('[AUTH] Stack:', (error as Error).stack);
          return null;
        }
      }
    }),
    // GoogleProvider temporarily disabled to fix OAuthAccountNotLinked error
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID || "",
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    // }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? `__Secure-next-auth.session-token` 
        : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
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
  debug: true, // Enable debug for production troubleshooting
}
// Force rebuild - cookie fix 1767529200
