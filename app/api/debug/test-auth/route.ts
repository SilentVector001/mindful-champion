import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    // Test database connection
    const userCount = await prisma.user.count()
    
    // Try to find the test user
    const testUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: 'deansnow59@gmail.com',
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

    if (!testUser) {
      return NextResponse.json({
        success: false,
        error: 'Test user not found',
        userCount,
      })
    }

    // Test password verification
    const testPassword = 'MindfulChampion2025!'
    const isPasswordValid = testUser.password 
      ? await bcrypt.compare(testPassword, testUser.password)
      : false

    return NextResponse.json({
      success: true,
      userCount,
      user: {
        id: testUser.id,
        email: testUser.email,
        name: testUser.name,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        hasPassword: !!testUser.password,
        passwordLength: testUser.password?.length || 0,
        passwordValid: isPasswordValid,
        role: testUser.role,
        subscriptionTier: testUser.subscriptionTier,
        isTrialActive: testUser.isTrialActive,
        onboardingCompleted: testUser.onboardingCompleted,
      },
      env: {
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        nextAuthUrl: process.env.NEXTAUTH_URL,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 })
  }
}
