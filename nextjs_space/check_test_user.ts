import { prisma } from './lib/db'

async function main() {
  const users = await prisma.user.findMany({
    take: 5,
    select: {
      id: true,
      email: true,
      name: true,
      role: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
  
  console.log('Recent users in database:')
  users.forEach(user => {
    console.log(`- ${user.email} (${user.name}) - Role: ${user.role}`)
  })
  
  // Check for test user
  const testUser = await prisma.user.findUnique({
    where: { email: 'champion@example.com' }
  })
  
  if (testUser) {
    console.log('\nTest user found:', testUser.email)
  } else {
    console.log('\nNo test user found')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
