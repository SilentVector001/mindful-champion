import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Get user's favorite drills
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session?.user?.id ?? ''
    const favorites = await prisma.favoriteDrill.findMany({
      where: { userId },
      include: {
        drill: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const drills = favorites?.map(f => f?.drill)?.filter(Boolean) ?? []

    return NextResponse.json({
      success: true,
      favorites: drills,
      total: drills?.length ?? 0,
    })
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    )
  }
}

// Toggle favorite status
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { drillId } = body ?? {}

    if (!drillId) {
      return NextResponse.json(
        { error: 'Drill ID is required' },
        { status: 400 }
      )
    }

    const userId = session?.user?.id ?? ''

    // Check if already favorited
    const existing = await prisma.favoriteDrill.findUnique({
      where: {
        userId_drillId: {
          userId,
          drillId,
        },
      },
    })

    if (existing) {
      // Remove favorite
      await prisma.favoriteDrill.delete({
        where: { id: existing?.id ?? '' },
      })

      return NextResponse.json({
        success: true,
        isFavorite: false,
        message: 'Drill removed from favorites',
      })
    } else {
      // Add favorite
      await prisma.favoriteDrill.create({
        data: {
          userId,
          drillId,
        },
      })

      return NextResponse.json({
        success: true,
        isFavorite: true,
        message: 'Drill added to favorites',
      })
    }
  } catch (error) {
    console.error('Error toggling favorite:', error)
    return NextResponse.json(
      { error: 'Failed to toggle favorite' },
      { status: 500 }
    )
  }
}
