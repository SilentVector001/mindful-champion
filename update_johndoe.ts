import { prisma } from './lib/db'

async function updateUser() {
  const user = await prisma.user.update({
    where: { email: 'johndoe@johndoe.com' },
    data: { role: 'ADMIN' }
  })
  
  console.log('Updated user:', user.email, 'to role:', user.role)
}

updateUser()
  .catch(console.error)
  .finally(() => process.exit(0))
