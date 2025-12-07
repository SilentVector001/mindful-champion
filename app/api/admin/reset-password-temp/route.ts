import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const adminEmail = 'deansnow59@gmail.com'
    const newPassword = 'MindfulChampion2025!'
    
    console.log('🔧 Restoring admin access...')
    
    // Find the user
    let user = await prisma.user.findUnique({
      where: { email: adminEmail }
    })
    
    if (!user) {
      console.log('❌ User not found. Creating admin user...')
      // Create new admin user
      const hashedPassword = await bcrypt.hash(newPassword, 10)
      user = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          firstName: 'Dean',
          lastName: 'Snow',
          name: 'Dean Snow',
          role: 'ADMIN',
          emailVerified: new Date(),
          onboardingCompleted: true,
          subscriptionTier: 'PREMIUM',
          isTrialActive: false,
          failedLoginAttempts: 0,
        }
      })
      
      return NextResponse.json({
        success: true,
        message: 'Admin user created successfully!',
        email: adminEmail,
        password: newPassword,
        note: 'Please change this password after logging in!'
      })
    } else {
      console.log('✅ User found! Updating password...')
      
      // Update password, role, and reset failed login attempts
      const hashedPassword = await bcrypt.hash(newPassword, 10)
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          role: 'ADMIN',
          emailVerified: new Date(),
          failedLoginAttempts: 0,
        }
      })
      
      // Verify the update
      const verifyUser = await prisma.user.findUnique({
        where: { email: adminEmail },
        select: {
          id: true,
          email: true,
          role: true,
          firstName: true,
          lastName: true,
          subscriptionTier: true,
          failedLoginAttempts: true,
          emailVerified: true,
          onboardingCompleted: true,
        }
      })
      
      return NextResponse.json({
        success: true,
        message: 'Admin password reset successfully!',
        email: adminEmail,
        password: newPassword,
        note: 'Please change this password after logging in!',
        verification: verifyUser
      })
    }
    
  } catch (error) {
    console.error('❌ Error restoring admin access:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
