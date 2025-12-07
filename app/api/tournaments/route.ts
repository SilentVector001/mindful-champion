
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic";
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { SkillLevel, TournamentStatus } from '@/lib/prisma-types'

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    
    // Get query parameters
    const city = searchParams.get('city')
    const state = searchParams.get('state')
    const zipCode = searchParams.get('zipCode')
    const skillLevel = searchParams.get('skillLevel')
    const status = searchParams.get('status')
    const maxDistance = searchParams.get('maxDistance') // in miles
    const userLat = searchParams.get('lat')
    const userLon = searchParams.get('lon')
    const format = searchParams.get('format')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build where clause
    const where: any = {}

    if (city) {
      where.city = { contains: city, mode: 'insensitive' }
    }

    if (state) {
      where.state = { equals: state, mode: 'insensitive' }
    }

    if (zipCode) {
      where.zipCode = zipCode
    }

    if (skillLevel) {
      where.skillLevels = { has: skillLevel as SkillLevel }
    }

    if (status) {
      where.status = status as TournamentStatus
    } else {
      // Default: only show upcoming and registration open tournaments
      where.status = {
        in: [TournamentStatus.UPCOMING, TournamentStatus.REGISTRATION_OPEN]
      }
    }

    if (format) {
      where.format = { has: format }
    }

    // Date filtering
    if (startDate || endDate) {
      where.AND = []
      if (startDate) {
        where.AND.push({ startDate: { gte: new Date(startDate) } })
      }
      if (endDate) {
        where.AND.push({ endDate: { lte: new Date(endDate) } })
      }
    }

    // Fetch tournaments
    let tournaments = await prisma.tournament.findMany({
      where,
      include: {
        _count: {
          select: { registrations: true }
        },
        registrations: session.user.id ? {
          where: { userId: session.user.id },
          select: { id: true, status: true }
        } : false
      },
      orderBy: { startDate: 'asc' }
    })

    // Calculate distance if coordinates provided
    if (userLat && userLon && maxDistance) {
      const lat = parseFloat(userLat)
      const lon = parseFloat(userLon)
      const maxDist = parseFloat(maxDistance)

      tournaments = tournaments
        .map(t => ({
          ...t,
          distance: t.latitude && t.longitude 
            ? calculateDistance(lat, lon, t.latitude, t.longitude)
            : null
        }))
        .filter(t => t.distance === null || t.distance <= maxDist)
        .sort((a, b) => {
          if (a.distance === null) return 1
          if (b.distance === null) return -1
          return a.distance - b.distance
        })
    }

    // Add user registration status
    const tournamentsWithStatus = tournaments.map(t => ({
      ...t,
      isRegistered: t.registrations && t.registrations.length > 0,
      registrationStatus: t.registrations?.[0]?.status || null,
      spotsAvailable: t.maxParticipants ? t.maxParticipants - t.currentRegistrations : null
    }))

    return NextResponse.json({ 
      tournaments: tournamentsWithStatus,
      count: tournamentsWithStatus.length 
    })
  } catch (error) {
    console.error('Error fetching tournaments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tournaments' },
      { status: 500 }
    )
  }
}
