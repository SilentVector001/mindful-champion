import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function main() {
  const programs = await prisma.trainingProgram.findMany()
  console.log('Total Training Programs:', programs.length)
  
  if (programs.length > 0) {
    console.log('\nPrograms:')
    programs.forEach(p => {
      console.log(`- ${p.name} (${p.skillLevel}) - Active: ${p.isActive}`)
    })
  } else {
    console.log('\n❌ NO TRAINING PROGRAMS FOUND IN DATABASE!')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
