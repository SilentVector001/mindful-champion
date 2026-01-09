import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const recentUsers = await prisma.user.findMany({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 48 * 60 * 60 * 1000) // Last 48 hours
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    select: {
      id: true,
      name: true,
      email: true,
      firstName: true,
      lastName: true,
      createdAt: true,
      welcomeEmailSent: true
    }
  })

  console.log('\n=== Recent Users (Last 48 Hours) ===')
  console.log(`Found ${recentUsers.length} users:\n`)
  
  recentUsers.forEach(user => {
    console.log(`Name: ${user.name || user.firstName + ' ' + user.lastName}`)
    console.log(`Email: ${user.email}`)
    console.log(`Created: ${user.createdAt}`)
    console.log(`Welcome Email Sent: ${user.welcomeEmailSent ? 'Yes' : 'No'}`)
    console.log('---')
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
