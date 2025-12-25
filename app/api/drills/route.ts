import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { drillsDatabase } from '@/lib/drills-data'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')
    const ageGroup = searchParams.get('ageGroup')
    const gender = searchParams.get('gender')
    const duration = searchParams.get('duration')
    const search = searchParams.get('search')
    const playersRequired = searchParams.get('playersRequired')

    // Filter drills using static database
    let filteredDrills = [...drillsDatabase]

    // Category filter
    if (category && category !== 'all') {
      filteredDrills = filteredDrills.filter(d => d.category === category)
    }

    // Difficulty filter
    if (difficulty && difficulty !== 'all') {
      filteredDrills = filteredDrills.filter(d => d.difficulty === difficulty)
    }

    // Age group filter
    if (ageGroup && ageGroup !== 'all') {
      filteredDrills = filteredDrills.filter(d => 
        d.ageGroup?.includes(ageGroup) || d.ageGroup?.includes('all')
      )
    }

    // Gender filter
    if (gender && gender !== 'all') {
      filteredDrills = filteredDrills.filter(d => 
        d.gender?.includes(gender) || d.gender?.includes('all')
      )
    }

    // Duration filter
    if (duration) {
      const maxDuration = parseInt(duration)
      filteredDrills = filteredDrills.filter(d => d.duration <= maxDuration)
    }

    // Players required filter
    if (playersRequired) {
      filteredDrills = filteredDrills.filter(d => d.playerCount === playersRequired)
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filteredDrills = filteredDrills.filter(d =>
        d.name.toLowerCase().includes(searchLower) ||
        d.tagline.toLowerCase().includes(searchLower) ||
        d.description.toLowerCase().includes(searchLower) ||
        d.focusAreas.some(f => f.toLowerCase().includes(searchLower))
      )
    }

    // Sort drills by popularity and effectiveness
    filteredDrills.sort((a, b) => {
      const scoreA = a.popularityScore + a.effectivenessRating * 2
      const scoreB = b.popularityScore + b.effectivenessRating * 2
      return scoreB - scoreA
    })

    // Get user's favorites and progress
    const userId = session?.user?.id ?? ''
    const favorites = userId
      ? await prisma.favoriteDrill.findMany({
          where: { userId },
          select: { drillId: true },
        })
      : []

    const favoriteIds = new Set(favorites?.map(f => f?.drillId ?? '')?.filter(Boolean) ?? [])

    const progress = userId
      ? await prisma.userDrillProgress.findMany({
          where: { userId },
        })
      : []

    const progressMap = new Map(
      progress?.map(p => [p?.drillId ?? '', p])?.filter(([id]) => id) ?? []
    )

    // Enhance drills with user data
    const enhancedDrills = filteredDrills?.map(drill => ({
      ...drill,
      isFavorite: favoriteIds?.has(drill?.id ?? '') ?? false,
      userProgress: progressMap?.get(drill?.id ?? '') ?? null,
    })) ?? []

    return NextResponse.json({
      success: true,
      drills: enhancedDrills,
      total: enhancedDrills?.length ?? 0,
    })
  } catch (error) {
    console.error('Error fetching drills:', error)
    return NextResponse.json(
      { error: 'Failed to fetch drills' },
      { status: 500 }
    )
  }
}
