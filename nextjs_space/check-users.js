const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUsers() {
  try {
    console.log('=== Connecting to Database ===\n')
    
    // Count users
    const userCount = await prisma.user.count()
    console.log(`Total users in database: ${userCount}\n`)
    
    // Get all users (with limited data for privacy)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        emailVerified: true,
      },
      take: 20
    })
    
    console.log('=== User Accounts Found ===')
    users.forEach(user => {
      console.log(`- ${user.email} (${user.name || 'No name'}) - Created: ${user.createdAt.toISOString().split('T')[0]}`)
    })
    
    // Check accounts table
    console.log('\n=== Checking Accounts Table ===')
    const accountCount = await prisma.account.count()
    console.log(`Total accounts: ${accountCount}`)
    
    // Check session table
    console.log('\n=== Checking Sessions Table ===')
    const sessionCount = await prisma.session.count()
    console.log(`Total active sessions: ${sessionCount}`)
    
    console.log('\n✅ Database connection working!')
    
  } catch (error) {
    console.error('❌ Error connecting to database:', error.message)
    console.error('Full error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()
