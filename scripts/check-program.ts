import { prisma } from '../lib/db'

async function main() {
  try {
    const program = await prisma.trainingProgram.findFirst({
      where: {
        OR: [
          { id: 'beginner-serve-return' },
          { programId: 'beginner-serve-return' }
        ]
      }
    })
    
    if (program) {
      console.log('=== PROGRAM FOUND ===')
      console.log('ID:', program.id)
      console.log('ProgramID:', program.programId)
      console.log('Name:', program.name)
      console.log('Duration Days:', program.durationDays)
      console.log('')
      console.log('=== DAILY STRUCTURE ===')
      console.log('Type:', typeof program.dailyStructure)
      console.log('Is Array:', Array.isArray(program.dailyStructure))
      const structure = program.dailyStructure
      if (Array.isArray(structure)) {
        console.log('Length:', structure.length)
        if (structure.length > 0) {
          console.log('First Day:', JSON.stringify(structure[0], null, 2).substring(0, 800))
        }
      } else if (structure && typeof structure === 'object') {
        console.log('Keys:', Object.keys(structure as any))
        console.log('Sample:', JSON.stringify(structure).substring(0, 800))
      } else {
        console.log('Raw:', JSON.stringify(structure).substring(0, 800))
      }
    } else {
      console.log('PROGRAM NOT FOUND - beginner-serve-return')
    }
    
    console.log('\n=== ALL PROGRAMS ===')
    const allPrograms = await prisma.trainingProgram.findMany({
      select: {
        id: true,
        programId: true,
        name: true,
        durationDays: true,
        dailyStructure: true
      }
    })
    
    console.log('Total programs:', allPrograms.length)
    for (const p of allPrograms) {
      const struct = p.dailyStructure
      let dayCount = 'unknown'
      if (Array.isArray(struct)) {
        dayCount = String(struct.length)
      } else if (struct && typeof struct === 'object' && 'days' in (struct as any)) {
        dayCount = String((struct as any).days?.length || 0)
      }
      console.log('- ' + p.name + ' (' + p.programId + '): ' + p.durationDays + ' days, structure has ' + dayCount + ' entries')
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
