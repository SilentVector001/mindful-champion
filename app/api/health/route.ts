import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const testUser = searchParams.get('testUser')
  
  // If testUser param provided, check that user's password hash
  if (testUser) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: testUser },
        select: { id: true, email: true, password: true, name: true }
      })
      
      if (!user) {
        return NextResponse.json({ error: 'User not found', email: testUser }, { status: 404 })
      }
      
      // Test password verification
      const testPassword = 'MindfulChampion2025!'
      const isValid = user.password ? await bcrypt.compare(testPassword, user.password) : false
      
      return NextResponse.json({
        found: true,
        email: user.email,
        name: user.name,
        hasPassword: !!user.password,
        passwordLength: user.password?.length || 0,
        passwordPrefix: user.password?.substring(0, 10) || 'none',
        testPasswordValid: isValid,
        timestamp: new Date().toISOString()
      })
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    
    // Check environment variables (without exposing secrets)
    const envCheck = {
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      nextAuthUrl: process.env.NEXTAUTH_URL, // Safe to expose
      nodeEnv: process.env.NODE_ENV,
    }
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      environment: envCheck,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error?.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      },
      { status: 500 }
    )
  }
}
// Force rebuild 1767652992
