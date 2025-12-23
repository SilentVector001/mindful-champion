/**
 * Update tournament dates: any tournament before Dec 23, 2025 gets moved to 2026
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateTournamentDates() {
  const today = new Date('2025-12-23')
  
  // Get all tournaments with dates before today
  const pastTournaments = await prisma.tournament.findMany({
    where: {
      startDate: {
        lt: today
      }
    }
  })

  console.log(`Found ${pastTournaments.length} tournaments with past dates`)

  for (const tournament of pastTournaments) {
    const oldStart = new Date(tournament.startDate)
    const oldEnd = new Date(tournament.endDate)
    
    // Move to 2026 (add 1 year)
    const newStart = new Date(oldStart)
    newStart.setFullYear(newStart.getFullYear() + 1)
    
    const newEnd = new Date(oldEnd)
    newEnd.setFullYear(newEnd.getFullYear() + 1)

    await prisma.tournament.update({
      where: { id: tournament.id },
      data: {
        startDate: newStart,
        endDate: newEnd
      }
    })

    console.log(`Updated: ${tournament.name}`)
    console.log(`  ${oldStart.toDateString()} -> ${newStart.toDateString()}`)
  }

  console.log('\nDone! All past tournaments moved to 2026.')
}

updateTournamentDates()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
