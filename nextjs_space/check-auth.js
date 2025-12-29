const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkAuth() {
  try {
    console.log('=== Checking Authentication Setup ===\n')
    
    // Get user with password
    const user = await prisma.user.findUnique({
      where: { email: 'admin@mindfulchampion.com' },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        emailVerified: true,
        createdAt: true,
      }
    })
    
    if (!user) {
      console.log('❌ User admin@mindfulchampion.com NOT FOUND')
      return
    }
    
    console.log('✅ User found:', user.email)
    console.log('   Name:', user.name)
    console.log('   Email verified:', user.emailVerified)
    console.log('   Created:', user.createdAt)
    console.log('   Has password:', user.password ? 'YES' : 'NO')
    
    if (user.password) {
      console.log('   Password starts with:', user.password.substring(0, 10) + '...')
      console.log('   Password length:', user.password.length)
      console.log('   Looks like bcrypt hash:', user.password.startsWith('$2a$') || user.password.startsWith('$2b$'))
    }
    
    // Check environment variables
    console.log('\n=== Checking Environment Variables ===')
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing')
    console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing')
    console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL || '❌ Missing')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkAuth()
