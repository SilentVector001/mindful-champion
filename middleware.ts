import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Public paths that don't require authentication
const publicPaths = [
  '/', // Landing page (features) - accessible to everyone
  '/auth/signin',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/api/auth',
  '/_next',
  '/favicon.ico',
  '/images',
  '/videos',
  '/static',
  '/test-ptt', // PTT Debug page
]

// Paths that trial-expired users can still access
const allowedPathsForExpiredTrial = [
  '/upgrade',
  '/settings',
  '/api/billing',
  '/api/user/trial-status',
  '/auth/signout',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // For API routes (except public ones), let them handle their own authentication
  // Don't redirect API routes to signin page - they should return JSON errors
  const isApiRoute = pathname.startsWith('/api')

  // Check if user is authenticated
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // If not authenticated, redirect to sign in (but not for API routes)
  if (!token) {
    if (isApiRoute) {
      // Let API routes handle their own 401 responses
      return NextResponse.next()
    }
    const signInUrl = new URL('/auth/signin', request.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Check trial expiration for FREE tier users
  if (token.subscriptionTier === 'FREE') {
    const trialExpired = token.trialExpired as boolean
    const trialEndDate = token.trialEndDate as string

    // Calculate if trial is expired
    let isExpired = trialExpired
    if (!isExpired && trialEndDate) {
      const now = new Date()
      const trialEnd = new Date(trialEndDate)
      isExpired = now > trialEnd
    }

    // If trial expired, redirect to upgrade page (except for allowed paths)
    if (isExpired && !allowedPathsForExpiredTrial.some(path => pathname.startsWith(path))) {
      const upgradeUrl = new URL('/upgrade', request.url)
      return NextResponse.redirect(upgradeUrl)
    }
  }

  // Check onboarding completion from JWT token
  // Note: We rely on the JWT token for onboarding status since middleware runs in Edge Runtime
  // and cannot access Prisma. The token is refreshed on sign-in and after onboarding completion.
  if (!token.onboardingCompleted && pathname !== '/onboarding' && !pathname.startsWith('/api')) {
    return NextResponse.redirect(new URL('/onboarding', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder including HTML, images, videos, etc.)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|html|mp4|webm|ico|css|js|wasm)$).*)',
  ],
}
