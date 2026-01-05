import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: { equals: 'deansnow59@gmail.com', mode: 'insensitive' } },
    select: { id: true, email: true, password: true }
  })
  
  console.log('User found:', !!user)
  console.log('User ID:', user?.id)
  console.log('Password exists:', !!user?.password)
  console.log('Password length:', user?.password?.length)
  console.log('Password starts with $2:', user?.password?.startsWith('$2'))
  
  if (user?.password) {
    const testPassword = 'MindfulChampion2025!'
    const isValid = await bcrypt.compare(testPassword, user.password)
    console.log('Password "MindfulChampion2025!" valid:', isValid)
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
