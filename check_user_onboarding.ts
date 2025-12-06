import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'johndoe@example.com' },
      select: {
        id: true,
        email: true,
        onboardingCompleted: true
      }
    })
    console.log('User data:', JSON.stringify(user, null, 2))
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUser()
