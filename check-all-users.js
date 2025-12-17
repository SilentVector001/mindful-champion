const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkAllUsers() {
  try {
    console.log('=== Complete User Database Analysis ===\n')
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        password: true,
        role: true,
        subscriptionTier: true,
        createdAt: true,
        emailVerified: true,
        onboardingCompleted: true,
      },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`Total users: ${users.length}\n`)
    
    if (users.length === 0) {
      console.log('❌ NO USERS FOUND IN DATABASE!')
      console.log('   This means the database is empty or the connection is wrong.')
      return
    }
    
    console.log('=== User Details ===\n')
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`)
      console.log(`   Name: ${user.name || `${user.firstName} ${user.lastName}`}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Subscription: ${user.subscriptionTier}`)
      console.log(`   Has Password: ${user.password ? '✅ Yes' : '❌ No'}`)
      console.log(`   Email Verified: ${user.emailVerified ? '✅ Yes' : '❌ No'}`)
      console.log(`   Onboarding Complete: ${user.onboardingCompleted ? '✅ Yes' : '❌ No'}`)
      console.log(`   Created: ${user.createdAt.toISOString().split('T')[0]}`)
      console.log('')
    })
    
    // Check for OAuth accounts
    const accountCount = await prisma.account.count()
    console.log(`OAuth Accounts: ${accountCount}`)
    
    if (accountCount > 0) {
      const accounts = await prisma.account.findMany({
        select: {
          provider: true,
          user: {
            select: { email: true }
          }
        }
      })
      console.log('OAuth Providers:')
      accounts.forEach(acc => {
        console.log(`  - ${acc.user.email}: ${acc.provider}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

checkAllUsers()
