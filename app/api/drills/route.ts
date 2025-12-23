import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
    const skillLevel = searchParams.get('skillLevel')
    const equipment = searchParams.get('equipment')
    const duration = searchParams.get('duration')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')
    const playersRequired = searchParams.get('playersRequired')

    const where: any = {
      active: true,
    }

    // Category filter
    if (category && category !== 'all') {
      where.category = category
    }

    // Difficulty filter
    if (difficulty && difficulty !== 'all') {
      where.difficulty = difficulty
    }

    // Age group filter (check if ageGroup is in the ageGroups JSON array)
    if (ageGroup && ageGroup !== 'all') {
      where.ageGroups = {
        array_contains: ageGroup,
      }
    }

    // Gender filter
    if (gender && gender !== 'all') {
      where.gender = gender
    }

    // Duration filter (less than or equal)
    if (duration) {
      where.duration = {
        lte: parseInt(duration),
      }
    }

    // Players required filter
    if (playersRequired) {
      where.playersRequired = playersRequired
    }

    // Featured filter
    if (featured === 'true') {
      where.featured = true
    }

    // Search filter (title, tagline, description, or focusAreas)
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { tagline: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const drills = await prisma.drill.findMany({
      where,
      orderBy: [
        { featured: 'desc' },
        { popularityScore: 'desc' },
        { title: 'asc' },
      ],
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
    const enhancedDrills = drills?.map(drill => ({
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
