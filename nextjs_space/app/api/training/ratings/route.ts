//@ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const programId = searchParams.get('programId')

    if (!programId) {
      return NextResponse.json({ error: 'Program ID required' }, { status: 400 })
    }

    const ratings = await prisma.programRating.findMany({
      where: { programId },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    const avgRating = ratings?.length > 0
      ? ratings.reduce((sum, r) => sum + (r?.rating ?? 0), 0) / ratings.length
      : 0

    const ratingDistribution = [5, 4, 3, 2, 1].map(r => ({
      rating: r,
      count: ratings.filter(review => review?.rating === r)?.length ?? 0
    }))

    return NextResponse.json({
      ratings,
      averageRating: avgRating.toFixed(1),
      totalRatings: ratings?.length ?? 0,
      distribution: ratingDistribution
    })
  } catch (error) {
    console.error('Error fetching ratings:', error)
    return NextResponse.json({ error: 'Failed to fetch ratings' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { programId, rating, review } = await req.json()

    if (!programId || !rating) {
      return NextResponse.json({ error: 'Program ID and rating required' }, { status: 400 })
    }

    const programRating = await prisma.programRating.upsert({
      where: {
        userId_programId: { userId: session.user.id, programId }
      },
      update: { rating, review },
      create: {
        userId: session.user.id,
        programId,
        rating,
        review
      }
    })

    return NextResponse.json({ success: true, rating: programRating })
  } catch (error) {
    console.error('Error saving rating:', error)
    return NextResponse.json({ error: 'Failed to save rating' }, { status: 500 })
  }
}
