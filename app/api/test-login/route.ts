import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    console.log('[TEST-LOGIN] Starting diagnostic test...')
    
    // Test 1: Database connection
    console.log('[TEST-LOGIN] Test 1: Checking database connection...')
    const userCount = await prisma.user.count()
    console.log('[TEST-LOGIN] User count:', userCount)
    
    // Test 2: Find test user
    console.log('[TEST-LOGIN] Test 2: Looking up test user...')
    const testEmail = 'deansnow59@gmail.com'
    const normalizedEmail = testEmail.toLowerCase().trim()
    
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
      }
    })

    console.log('[TEST-LOGIN] User found:', !!user)
    console.log('[TEST-LOGIN] User ID:', user?.id || 'N/A')
    console.log('[TEST-LOGIN] Has password:', !!user?.password)
    console.log('[TEST-LOGIN] Password length:', user?.password?.length || 0)
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Test user not found',
        userCount,
        searchedEmail: normalizedEmail,
      })
    }
    
    if (!user.password) {
      return NextResponse.json({
        success: false,
        error: 'User has no password',
        user: {
          id: user.id,
          email: user.email,
          hasPassword: false,
        }
      })
    }

    // Test 3: Password verification
    console.log('[TEST-LOGIN] Test 3: Verifying password...')
    const testPassword = 'MindfulChampion2025!'
    const isPasswordValid = await bcrypt.compare(testPassword, user.password)
    console.log('[TEST-LOGIN] Password valid:', isPasswordValid)

    // Test 4: Environment variables
    console.log('[TEST-LOGIN] Test 4: Checking environment variables...')
    const envCheck = {
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      nextAuthUrl: process.env.NEXTAUTH_URL,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 30) + '...',
    }
    console.log('[TEST-LOGIN] Environment:', JSON.stringify(envCheck, null, 2))

    return NextResponse.json({
      success: true,
      userCount,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        hasPassword: !!user.password,
        passwordLength: user.password?.length || 0,
        passwordHashPrefix: user.password?.substring(0, 10) + '...',
        passwordValid: isPasswordValid,
        role: user.role,
        subscriptionTier: user.subscriptionTier,
        isTrialActive: user.isTrialActive,
        onboardingCompleted: user.onboardingCompleted,
      },
      env: envCheck,
    })
  } catch (error: any) {
    console.error('[TEST-LOGIN] ERROR:', error.message)
    console.error('[TEST-LOGIN] Stack:', error.stack)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 })
  }
}
