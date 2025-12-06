const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'deansnow59@gmail.com' },
    select: {
      id: true,
      email: true,
      role: true,
      onboardingCompleted: true,
      onboardingCompletedAt: true,
      primaryGoals: true,
      biggestChallenges: true,
      skillLevel: true,
      createdAt: true
    }
  })
  
  console.log('User Status:')
  console.log(JSON.stringify(user, null, 2))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
