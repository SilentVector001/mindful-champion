// @ts-nocheck
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { calculateTournamentStats, ALL_TOURNAMENTS, getUpcomingTournaments } from '@/lib/tournaments-data'

export const dynamic = 'force-dynamic'

// Helper to extract state
function extractState(location?: string): string | null {
  if (!location) return null
  const match = location.match(/,\s*([A-Z]{2})(?:\s|$)/)
  return match ? match[1] : null
}

export async function GET() {
  try {
    const now = new Date()
    
    // Get database tournaments
    const dbTournaments = await prisma.tournament.findMany({
      where: { startDate: { gte: now } },
      select: { id: true, prizePool: true, tier: true, type: true, state: true, location: true }
    })

    // Use static data if no DB tournaments
    const tournaments = dbTournaments.length > 0 ? dbTournaments : getUpcomingTournaments()
    
    // Calculate stats
    const uniqueStates = new Set<string>()
    let totalPrize = 0
    let majorEvents = 0
    
    tournaments.forEach((t: any) => {
      const state = t.state || extractState(t.location)
      if (state) uniqueStates.add(state.toUpperCase())
      if (t.prizePool) totalPrize += t.prizePool
      if (t.points) totalPrize += t.points * 100
      if (t.tier === 'major') majorEvents++
    })

    return NextResponse.json({
      totalTournaments: tournaments.length,
      statesCovered: uniqueStates.size,
      totalPrize: totalPrize || 2000000, // Fallback to $2M
      majorEvents,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching tournament stats:', error)
    const staticStats = calculateTournamentStats()
    return NextResponse.json({
      totalTournaments: staticStats.totalTournaments,
      statesCovered: staticStats.statesCovered,
      totalPrize: staticStats.totalPrize || 2000000,
      majorEvents: staticStats.majorEvents,
    })
  }
}
