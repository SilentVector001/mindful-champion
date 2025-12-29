const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testPassword() {
  try {
    console.log('=== Testing Password Authentication ===\n')
    
    const user = await prisma.user.findUnique({
      where: { email: 'admin@mindfulchampion.com' },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
      }
    })
    
    if (!user || !user.password) {
      console.log('❌ User not found or no password set')
      return
    }
    
    console.log('✅ User found:', user.email)
    console.log('   Password hash:', user.password)
    
    // Test with a few common passwords
    const testPasswords = ['admin', 'Admin123', 'password', 'mindful123', 'Admin123!']
    
    console.log('\n=== Testing common passwords ===')
    for (const testPassword of testPasswords) {
      const isValid = await bcrypt.compare(testPassword, user.password)
      console.log(`   "${testPassword}": ${isValid ? '✅ MATCH' : '❌ No match'}`)
    }
    
    // Show how to create a new password hash
    console.log('\n=== To create a new user or reset password ===')
    const newHash = await bcrypt.hash('Admin123!', 10)
    console.log('Example: bcrypt hash for "Admin123!"')
    console.log('Hash:', newHash)
    
    console.log('\n=== To set this password for the admin user, run: ===')
    console.log(`UPDATE "User" SET password = '${newHash}' WHERE email = 'admin@mindfulchampion.com';`)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testPassword()
