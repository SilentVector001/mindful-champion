import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUpcomingTournaments, ALL_TOURNAMENTS } from '@/lib/tournaments-data'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // ISR: revalidate every hour

export async function GET() {
  try {
    const now = new Date()
    
    // Try database first
    let tournaments = await prisma.tournament.findMany({
      where: {
        startDate: { gte: now },
        // Only show upcoming events (not closed)
      },
      orderBy: { startDate: 'asc' },
      take: 100,
    })

    // If no DB tournaments, use static data
    if (!tournaments?.length) {
      tournaments = ALL_TOURNAMENTS
        .filter(t => new Date(t.startDate) >= now)
        .slice(0, 100)
        .map(t => ({
          id: t.id,
          name: t.name,
          location: t.location,
          venue: t.venue || null,
          state: extractState(t.location),
          city: extractCity(t.location),
          startDate: new Date(t.startDate),
          endDate: t.endDate ? new Date(t.endDate) : null,
          prizePool: t.prizePool || (t.points ? t.points * 100 : null),
          type: t.type,
          tier: t.tier,
          registrationUrl: t.registrationUrl,
          featured: t.featured || false,
          description: t.description || null,
          skillLevels: t.skillLevels || null,
          registrationOpen: new Date(t.startDate) > now,
        } as any))
    }

    // Format for response
    const formatted = tournaments.map(t => ({
      id: t.id,
      name: t.name,
      location: t.location || `${t.city || ''}, ${t.state || ''}`.trim(),
      venue: t.venue,
      state: t.state || extractState(t.location),
      city: t.city || extractCity(t.location),
      startDate: t.startDate,
      endDate: t.endDate,
      prizePool: t.prizePool,
      points: t.prizePool ? Math.round(t.prizePool / 100) : null,
      type: t.type,
      tier: t.tier,
      registrationUrl: t.registrationUrl,
      featured: t.featured,
      description: t.description,
      skillLevels: t.skillLevels,
      registrationOpen: true, // Assume open for upcoming
    }))

    return NextResponse.json({
      tournaments: formatted,
      count: formatted.length,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching all upcoming tournaments:', error)
    
    // Fallback to static data
    const now = new Date()
    const fallback = ALL_TOURNAMENTS
      .filter(t => new Date(t.startDate) >= now)
      .slice(0, 50)
      .map(t => ({
        id: t.id,
        name: t.name,
        location: t.location,
        venue: t.venue,
        state: extractState(t.location),
        startDate: t.startDate,
        endDate: t.endDate,
        prizePool: t.prizePool || (t.points ? t.points * 100 : null),
        type: t.type,
        tier: t.tier,
        registrationUrl: t.registrationUrl,
        featured: t.featured,
        description: t.description,
        registrationOpen: true,
      }))

    return NextResponse.json({
      tournaments: fallback,
      count: fallback.length,
      lastUpdated: new Date().toISOString(),
      fromCache: true,
    })
  }
}

// Helper to extract state abbreviation from location string
function extractState(location?: string): string | null {
  if (!location) return null
  const match = location.match(/,\s*([A-Z]{2})(?:\s|$)/)
  return match ? match[1] : null
}

// Helper to extract city from location string
function extractCity(location?: string): string | null {
  if (!location) return null
  const parts = location.split(',')
  return parts[0]?.trim() || null
}
