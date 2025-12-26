import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const count = await prisma.trainingProgram.count()
    console.log('Training programs in database:', count)
    
    const programs = await prisma.trainingProgram.findMany({
      take: 5,
      select: {
        id: true,
        programId: true,
        name: true,
        skillLevel: true,
        isActive: true
      }
    })
    console.log('\nSample programs:')
    programs.forEach(p => console.log(`  - ${p.name} (${p.skillLevel}) [${p.programId}] Active: ${p.isActive}`))
    
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
