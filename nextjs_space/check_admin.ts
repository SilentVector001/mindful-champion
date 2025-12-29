import { prisma } from './lib/db'

async function checkAdmin() {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, email: true, role: true, firstName: true, lastName: true }
    })
    console.log('Admin users:', JSON.stringify(admins, null, 2))
    
    const deanUser = await prisma.user.findUnique({
      where: { email: 'deansnow59@gmail.com' },
      select: { id: true, email: true, role: true, firstName: true }
    })
    console.log('\nDean user:', JSON.stringify(deanUser, null, 2))
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdmin()
