// @ts-nocheck
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { TournamentStatus } from '@prisma/client'
import { FEATURED_TOURNAMENTS, getUpcomingTournaments } from '@/lib/tournaments-data'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Try to get featured tournaments from database first
    let featuredTournaments = await prisma.tournament.findMany({
      where: {
        OR: [
          { status: TournamentStatus.REGISTRATION_OPEN },
          { status: TournamentStatus.IN_PROGRESS },
          { status: TournamentStatus.UPCOMING },
        ],
      },
      orderBy: [
        { prizePool: 'desc' },
        { startDate: 'asc' },
      ],
      take: 6,
    })

    // If no DB tournaments, use real static data from PPA/APP tours
    if (!featuredTournaments?.length) {
      const staticFeatured = FEATURED_TOURNAMENTS.slice(0, 6).map(t => ({
        id: t.id,
        name: t.name,
        location: t.location,
        startDate: t.startDate,
        endDate: t.endDate || null,
        prizePool: t.prizePool || t.points ? (t.points || 0) * 100 : null,
        type: t.tier,
        registrationUrl: t.registrationUrl,
        featured: true,
      }))
      return NextResponse.json({ tournaments: staticFeatured })
    }

    return NextResponse.json({ tournaments: featuredTournaments })
  } catch (error) {
    console.error('Error fetching featured tournaments:', error)
    // Fallback to static data on error
    const staticFeatured = FEATURED_TOURNAMENTS.slice(0, 6).map(t => ({
      id: t.id,
      name: t.name,
      location: t.location,
      startDate: t.startDate,
      endDate: t.endDate || null,
      prizePool: t.prizePool || t.points ? (t.points || 0) * 100 : null,
      type: t.tier,
      registrationUrl: t.registrationUrl,
      featured: true,
    }))
    return NextResponse.json({ tournaments: staticFeatured })
  }
}
