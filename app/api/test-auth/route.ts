import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log('[TEST-AUTH] Testing authentication for:', email)

    // Check if user exists
    const user = await prisma.user.findFirst({
      where: { 
        email: {
          equals: email,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        email: true,
        password: true,
        accountLocked: true,
        failedLoginAttempts: true
      }
    })

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not found',
        details: { userExists: false }
      })
    }

    if (!user.password) {
      return NextResponse.json({ 
        success: false, 
        message: 'User has no password set',
        details: { 
          userExists: true, 
          hasPassword: false,
          accountLocked: user.accountLocked
        }
      })
    }

    // Test password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    return NextResponse.json({ 
      success: isPasswordValid, 
      message: isPasswordValid ? 'Authentication successful' : 'Invalid password',
      details: {
        userExists: true,
        hasPassword: true,
        passwordValid: isPasswordValid,
        accountLocked: user.accountLocked,
        failedLoginAttempts: user.failedLoginAttempts,
        passwordHashPrefix: user.password.substring(0, 10)
      }
    })

  } catch (error: any) {
    console.error('[TEST-AUTH] Error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    }, { status: 500 })
  }
}
