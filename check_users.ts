import { prisma } from './lib/db'

async function checkUsers() {
  const users = await prisma.user.findMany({
    select: {
      email: true,
      name: true,
      role: true,
      emailVerified: true
    }
  })
  
  console.log('Users in database:')
  console.log(JSON.stringify(users, null, 2))
}

checkUsers()
  .catch(console.error)
  .finally(() => process.exit(0))
