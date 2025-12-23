import { PrismaClient } from '@prisma/client'
import { ALL_TOURNAMENTS } from '../lib/tournaments-data'

const prisma = new PrismaClient()

// Helper function to parse location into city and state
function parseLocation(location: string): { city: string; state: string } {
  const parts = location.split(',').map(p => p.trim())
  if (parts.length >= 2) {
    return {
      city: parts[0],
      state: parts[1]
    }
  }
  return {
    city: location,
    state: 'Unknown'
  }
}

// Helper function to map skill levels
function mapSkillLevels(skillLevels?: string[]): any[] {
  if (!skillLevels || skillLevels.length === 0) {
    return ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PRO']
  }
  
  const mapped = skillLevels.map(level => {
    switch (level) {
      case '3.0': return 'BEGINNER'
      case '3.5': return 'INTERMEDIATE'
      case '4.0': return 'INTERMEDIATE'
      case '4.5': return 'ADVANCED'
      case '5.0': return 'ADVANCED'
      case 'Pro': return 'PRO'
      default: return 'INTERMEDIATE'
    }
  })
  
  // Remove duplicates
  return [...new Set(mapped)]
}

// Helper function to determine organizer based on tournament type
function getOrganizer(type: string): { name: string; email: string } {
  if (type.startsWith('ppa')) {
    return {
      name: 'PPA Tour',
      email: 'info@ppatour.com'
    }
  } else if (type.startsWith('app')) {
    return {
      name: 'APP Tour',
      email: 'info@theapp.global'
    }
  }
  return {
    name: 'Tournament Organizer',
    email: 'info@tournament.com'
  }
}

async function main() {
  console.log('🎾 Starting tournament database seeding...')
  
  // Clear existing tournaments
  console.log('🗑️  Clearing existing tournaments...')
  await prisma.tournament.deleteMany({})
  
  // Seed tournaments
  console.log(`📝 Seeding ${ALL_TOURNAMENTS.length} tournaments...`)
  
  let successCount = 0
  let errorCount = 0
  
  for (const tournament of ALL_TOURNAMENTS) {
    try {
      const { city, state } = parseLocation(tournament.location)
      const organizer = getOrganizer(tournament.type)
      const skillLevels = mapSkillLevels(tournament.skillLevels)
      
      // Calculate registration dates (30 days before start, 7 days before start)
      const startDate = new Date(tournament.startDate)
      const registrationStart = new Date(startDate)
      registrationStart.setDate(registrationStart.getDate() - 30)
      const registrationEnd = new Date(startDate)
      registrationEnd.setDate(registrationEnd.getDate() - 7)
      
      await prisma.tournament.create({
        data: {
          id: tournament.id,
          name: tournament.name,
          description: tournament.description || `${tournament.name} - ${tournament.tier} tier tournament`,
          organizerName: organizer.name,
          organizerEmail: organizer.email,
          status: new Date(tournament.startDate) > new Date() ? 'UPCOMING' : 'COMPLETED',
          venueName: tournament.venue || tournament.location,
          address: tournament.venue || '',
          city: city,
          state: state,
          zipCode: '00000',
          country: 'USA',
          startDate: new Date(tournament.startDate),
          endDate: tournament.endDate ? new Date(tournament.endDate) : new Date(tournament.startDate),
          registrationStart: registrationStart,
          registrationEnd: registrationEnd,
          format: ['SINGLES', 'DOUBLES', 'MIXED_DOUBLES'],
          skillLevels: skillLevels,
          prizePool: tournament.prizePool,
          registrationUrl: tournament.registrationUrl,
          imageUrl: tournament.image,
        },
      })
      successCount++
      console.log(`✅ Seeded: ${tournament.name}`)
    } catch (error) {
      errorCount++
      console.error(`❌ Error seeding ${tournament.name}:`, error)
    }
  }
  
  console.log('\n📊 Seeding Summary:')
  console.log(`   ✅ Successfully seeded: ${successCount} tournaments`)
  console.log(`   ❌ Errors: ${errorCount}`)
  
  // Display stats
  const totalCount = await prisma.tournament.count()
  console.log(`\n🏆 Total Tournaments in Database: ${totalCount}`)
  
  const upcomingCount = await prisma.tournament.count({
    where: { status: 'UPCOMING' }
  })
  console.log(`   📅 Upcoming: ${upcomingCount}`)
  
  const completedCount = await prisma.tournament.count({
    where: { status: 'COMPLETED' }
  })
  console.log(`   ✅ Completed: ${completedCount}`)
  
  console.log('\n✨ Tournament seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Fatal error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
