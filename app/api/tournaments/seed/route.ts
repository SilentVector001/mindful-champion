import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { TournamentStatus, TournamentFormat, SkillLevel } from '@prisma/client'

// ADMIN-ONLY endpoint to seed real tournament data
export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Real tournament data
    const REAL_TOURNAMENTS = [
      {
        name: 'PPA Tour Championship Finals',
        description: 'The pinnacle of professional pickleball competition. Watch the best players in the world compete for the championship title at this prestigious year-end event.',
        organizerName: 'Professional Pickleball Association',
        organizerEmail: 'info@ppatour.com',
        venueName: 'Mandalay Bay Convention Center',
        address: '3950 S Las Vegas Blvd',
        city: 'Las Vegas',
        state: 'Nevada',
        zipCode: '89119',
        startDate: new Date('2025-12-12'),
        endDate: new Date('2025-12-15'),
        registrationStart: new Date('2025-10-01'),
        registrationEnd: new Date('2025-12-09'),
        format: [TournamentFormat.SINGLES, TournamentFormat.DOUBLES, TournamentFormat.MIXED_DOUBLES],
        skillLevels: [SkillLevel.PRO, SkillLevel.ADVANCED, SkillLevel.INTERMEDIATE, SkillLevel.BEGINNER],
        maxParticipants: 1000,
        entryFee: 125,
        prizePool: 283000,
        websiteUrl: 'https://www.ppatour.com/watch',
        registrationUrl: 'https://www.ppatour.com/tournament/championship-finals/',
        latitude: 36.0914,
        longitude: -115.1761,
        status: TournamentStatus.IN_PROGRESS,
        imageUrl: 'https://ppatour.com/wp-content/uploads/2023/12/TX-Open-DJI-Watermarked-scaled-1.webp',
      },
      {
        name: 'APP Fort Lauderdale Open',
        description: 'The APP Tour arrives in sunny South Florida for an action-packed week of pickleball. The Fort venue offers state-of-the-art courts and a vibrant atmosphere. All skill levels welcome from amateur to professional.',
        organizerName: 'Association of Pickleball Professionals',
        organizerEmail: 'info@theapp.global',
        venueName: 'The Fort',
        address: '1040 NE 4th Avenue',
        city: 'Fort Lauderdale',
        state: 'Florida',
        zipCode: '33304',
        startDate: new Date('2025-12-18'),
        endDate: new Date('2025-12-22'),
        registrationStart: new Date('2025-10-15'),
        registrationEnd: new Date('2025-12-15'),
        format: [TournamentFormat.SINGLES, TournamentFormat.DOUBLES, TournamentFormat.MIXED_DOUBLES],
        skillLevels: [SkillLevel.PRO, SkillLevel.ADVANCED, SkillLevel.INTERMEDIATE, SkillLevel.BEGINNER],
        maxParticipants: 600,
        entryFee: 95,
        prizePool: 125000,
        websiteUrl: 'https://www.theapp.global/tour/fort-lauderdale-open',
        registrationUrl: 'https://www.theapp.global/tour/fort-lauderdale-open',
        latitude: 26.1223,
        longitude: -80.1434,
        status: TournamentStatus.REGISTRATION_OPEN,
        imageUrl: 'https://i.ytimg.com/vi/K2RcRe2aUUc/maxresdefault.jpg',
      },
      // Add more tournaments here as needed
    ]

    // Clear existing tournaments
    const deleteCount = await prisma.tournament.deleteMany({})
    console.log(`Deleted ${deleteCount.count} existing tournaments`)

    // Seed new tournaments
    const created = await prisma.tournament.createMany({
      data: REAL_TOURNAMENTS,
    })

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${created.count} tournaments`,
      deletedCount: deleteCount.count,
      createdCount: created.count,
    })
  } catch (error) {
    console.error('Error seeding tournaments:', error)
    return NextResponse.json(
      { 
        error: 'Failed to seed tournaments', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
}
