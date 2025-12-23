import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Get user's drill progress
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session?.user?.id ?? ''
    const progress = await prisma.userDrillProgress.findMany({
      where: { userId },
      include: {
        drill: true,
      },
      orderBy: { lastCompletedAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      progress,
      total: progress?.length ?? 0,
    })
  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    )
  }
}

// Update drill progress (mark as completed)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { drillId, timeSpent, rating, notes } = body ?? {}

    if (!drillId) {
      return NextResponse.json(
        { error: 'Drill ID is required' },
        { status: 400 }
      )
    }

    const userId = session?.user?.id ?? ''

    // Find or create progress record
    const existing = await prisma.userDrillProgress.findUnique({
      where: {
        userId_drillId: {
          userId,
          drillId,
        },
      },
    })

    if (existing) {
      // Update existing progress
      const newCompletedCount = (existing?.completedCount ?? 0) + 1
      const newTotalTimeSpent = (existing?.totalTimeSpent ?? 0) + (timeSpent ?? 0)

      // Calculate new average rating if rating provided
      let newAverageRating = existing?.averageRating ?? null
      if (rating !== undefined && rating !== null) {
        const oldRatingSum = (existing?.averageRating ?? 0) * (existing?.completedCount ?? 0)
        newAverageRating = (oldRatingSum + rating) / newCompletedCount
      }

      const updated = await prisma.userDrillProgress.update({
        where: { id: existing?.id ?? '' },
        data: {
          completedCount: newCompletedCount,
          lastCompletedAt: new Date(),
          totalTimeSpent: newTotalTimeSpent,
          averageRating: newAverageRating,
          notes: notes ?? existing?.notes,
        },
      })

      return NextResponse.json({
        success: true,
        progress: updated,
        message: 'Progress updated successfully',
      })
    } else {
      // Create new progress record
      const created = await prisma.userDrillProgress.create({
        data: {
          userId,
          drillId,
          completedCount: 1,
          lastCompletedAt: new Date(),
          totalTimeSpent: timeSpent ?? 0,
          averageRating: rating ?? null,
          notes: notes ?? null,
        },
      })

      return NextResponse.json({
        success: true,
        progress: created,
        message: 'Progress tracked successfully',
      })
    }
  } catch (error) {
    console.error('Error updating progress:', error)
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    )
  }
}
