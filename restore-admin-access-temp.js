const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function restoreAdminAccess() {
  try {
    const adminEmail = 'deansnow59@gmail.com'
    const newPassword = 'MindfulChampion2025!'
    
    console.log('🔧 Restoring admin access...\n')
    
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
      console.log('✅ Admin user created!')
    } else {
      console.log('✅ User found!')
      
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
      console.log('✅ Password updated!')
      console.log('✅ Role set to ADMIN!')
      console.log('✅ Failed login attempts reset!')
    }
    
    // Display credentials
    console.log('\n' + '='.repeat(60))
    console.log('🎉 ADMIN ACCESS RESTORED!')
    console.log('='.repeat(60))
    console.log('\n📧 Email:', adminEmail)
    console.log('🔑 Password:', newPassword)
    console.log('👑 Role: ADMIN')
    console.log('\n⚠️  IMPORTANT: Please change this password after logging in!')
    console.log('='.repeat(60) + '\n')
    
    // Verify admin access
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
    
    console.log('✅ Verification:')
    console.log(JSON.stringify(verifyUser, null, 2))
    
  } catch (error) {
    console.error('❌ Error restoring admin access:', error)
  } finally {
    await prisma.$disconnect()
  }
}

restoreAdminAccess()
