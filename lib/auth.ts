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
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('[AUTH-DEBUG] ====== AUTHORIZE START ======');
        console.log('[AUTH-DEBUG] Timestamp:', new Date().toISOString());
        console.log('[AUTH-DEBUG] NEXTAUTH_URL:', process.env.NEXTAUTH_URL || 'NOT SET');
        console.log('[AUTH-DEBUG] NEXTAUTH_SECRET length:', process.env.NEXTAUTH_SECRET?.length || 0);
        console.log('[AUTH-DEBUG] NODE_ENV:', process.env.NODE_ENV);
        console.log('[AUTH-DEBUG] Email received:', credentials?.email);
        console.log('[AUTH-DEBUG] Password provided:', !!credentials?.password);
        console.log('[AUTH-DEBUG] Password length:', credentials?.password?.length || 0);
        console.log('[AUTH-DEBUG] NEXTAUTH_SECRET exists:', !!process.env.NEXTAUTH_SECRET);
        console.log('[AUTH-DEBUG] NEXTAUTH_SECRET length:', process.env.NEXTAUTH_SECRET?.length || 0);
        console.log('[AUTH-DEBUG] DATABASE_URL exists:', !!process.env.DATABASE_URL);
        
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log('[AUTH-DEBUG] FAIL: Missing email or password');
            return null;
          }

          console.log('[AUTH-DEBUG] Step 1: Looking up user in database...');
          const normalizedEmail = credentials.email.toLowerCase().trim();
          console.log('[AUTH-DEBUG] Normalized email:', normalizedEmail);
          
          const user = await prisma.user.findFirst({
            where: { 
              email: {
                equals: normalizedEmail,
                mode: 'insensitive'
              }
            }
          });

          console.log('[AUTH-DEBUG] Step 2: User lookup result');
          console.log('[AUTH-DEBUG] User found:', !!user);
          console.log('[AUTH-DEBUG] User ID:', user?.id || 'N/A');
          console.log('[AUTH-DEBUG] User email:', user?.email || 'N/A');
          console.log('[AUTH-DEBUG] Has password field:', !!user?.password);
          console.log('[AUTH-DEBUG] Password hash length:', user?.password?.length || 0);
          console.log('[AUTH-DEBUG] Password hash prefix:', user?.password?.substring(0, 10) || 'N/A');
          
          if (!user) {
            console.log('[AUTH-DEBUG] FAIL: No user found with email:', credentials.email);
            return null;
          }
          
          if (!user.password) {
            console.log('[AUTH-DEBUG] FAIL: User exists but has no password (OAuth only?)');
            return null;
          }

          console.log('[AUTH-DEBUG] Step 3: Comparing passwords with bcrypt...');
          console.log('[AUTH-DEBUG] Input password first char:', credentials.password.charAt(0));
          console.log('[AUTH-DEBUG] Stored hash algorithm:', user.password.substring(0, 7));
          
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          console.log('[AUTH-DEBUG] Step 4: bcrypt.compare result:', isPasswordValid);
          
          if (!isPasswordValid) {
            console.log('[AUTH-DEBUG] FAIL: Password does not match');
            console.log('[AUTH-DEBUG] This could mean:');
            console.log('[AUTH-DEBUG] - Wrong password entered');
            console.log('[AUTH-DEBUG] - Hash was created with different bcrypt version');
            console.log('[AUTH-DEBUG] - Hash corruption in database');
            return null;
          }

          console.log('[AUTH-DEBUG] Step 5: Updating lastActiveDate...');
          await prisma.user.update({
            where: { id: user.id },
            data: { 
              lastActiveDate: new Date(),
              loginCount: { increment: 1 }
            }
          });

          console.log('[AUTH-DEBUG] SUCCESS: Login completed for:', user.email);
          console.log('[AUTH-DEBUG] ====== AUTHORIZE END ======');

          return {
            id: user.id,
            email: user.email,
            name: user.name || `${user.firstName} ${user.lastName}`,
            role: user.role,
            subscriptionTier: user.subscriptionTier,
            isTrialActive: user.isTrialActive,
            onboardingCompleted: user.onboardingCompleted,
            rewardPoints: user.rewardPoints || 0,
          };
        } catch (error) {
          console.log('[AUTH-DEBUG] EXCEPTION CAUGHT:');
          console.log('[AUTH-DEBUG] Error name:', (error as Error).name);
          console.log('[AUTH-DEBUG] Error message:', (error as Error).message);
          console.log('[AUTH-DEBUG] Error stack:', (error as Error).stack);
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
