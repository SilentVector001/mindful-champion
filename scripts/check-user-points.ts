import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env' })

const prisma = new PrismaClient()

async function checkUserPoints() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'deansnow59@gmail.com' },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        rewardPoints: true
      }
    })

    if (user) {
      console.log('\n✅ User Found:')
      console.log('================')
      console.log(`Email: ${user.email}`)
      console.log(`Name: ${user.firstName} ${user.lastName}`)
      console.log(`Reward Points: ${user.rewardPoints}`)
      console.log('================\n')
    } else {
      console.log('\n❌ User not found with email: deansnow59@gmail.com\n')
    }
  } catch (error) {
    console.error('Error checking user points:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserPoints()
