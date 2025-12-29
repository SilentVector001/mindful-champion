import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getToken } from 'next-auth/jwt'

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  console.log('[Debug Session] Testing session...')
  
  try {
    // Test 1: Get server session
    const session = await getServerSession(authOptions)
    console.log('[Debug Session] Server Session:', session ? 'EXISTS' : 'NULL')
    
    // Test 2: Get JWT token
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    })
    console.log('[Debug Session] JWT Token:', token ? 'EXISTS' : 'NULL')
    
    // Test 3: Check cookies
    const cookies = request.cookies.getAll()
    console.log('[Debug Session] Cookies:', cookies.map(c => c.name))
    
    // Test 4: Environment check
    const nextAuthUrl = process.env.NEXTAUTH_URL
    const nextAuthSecret = process.env.NEXTAUTH_SECRET ? 'SET' : 'MISSING'
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      session: session ? {
        user: {
          id: session.user?.id,
          email: session.user?.email,
          name: session.user?.name
        }
      } : null,
      token: token ? {
        sub: token.sub,
        email: token.email
      } : null,
      cookies: cookies.map(c => ({ name: c.name, value: c.value.substring(0, 20) + '...' })),
      env: {
        nextAuthUrl,
        nextAuthSecret
      }
    })
  } catch (error) {
    console.error('[Debug Session] Error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
