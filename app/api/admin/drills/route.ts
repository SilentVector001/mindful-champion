import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Admin: Create a new drill
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      title,
      tagline,
      description,
      category,
      difficulty,
      ageGroups,
      gender,
      skillLevelRange,
      duration,
      playersRequired,
      equipment,
      focusAreas,
      instructions,
      proTips,
      commonMistakes,
      successMetrics,
      videos,
      benefits,
      relatedDrillIds,
      featured,
      active,
    } = body ?? {}

    if (!title || !category || !difficulty) {
      return NextResponse.json(
        { error: 'Title, category, and difficulty are required' },
        { status: 400 }
      )
    }

    const drill = await prisma.drill.create({
      data: {
        title,
        tagline: tagline ?? '',
        description: description ?? '',
        category,
        difficulty,
        ageGroups: ageGroups ?? ['All Ages'],
        gender: gender ?? 'All',
        skillLevelRange: skillLevelRange ?? '1.0-5.0+',
        duration: duration ?? 10,
        playersRequired: playersRequired ?? '1',
        equipment: equipment ?? ['None'],
        focusAreas: focusAreas ?? [],
        instructions: instructions ?? [],
        proTips: proTips ?? [],
        commonMistakes: commonMistakes ?? [],
        successMetrics: successMetrics ?? '',
        videos: videos ?? [],
        benefits: benefits ?? [],
        relatedDrillIds: relatedDrillIds ?? [],
        popularityScore: 0,
        effectivenessRating: 5.0,
        featured: featured ?? false,
        active: active ?? true,
      },
    })

    return NextResponse.json({
      success: true,
      drill,
      message: 'Drill created successfully',
    })
  } catch (error) {
    console.error('Error creating drill:', error)
    return NextResponse.json(
      { error: 'Failed to create drill' },
      { status: 500 }
    )
  }
}
