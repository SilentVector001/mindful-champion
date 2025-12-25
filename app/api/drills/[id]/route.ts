import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getDrillById } from '@/lib/drills-data'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const drill = getDrillById(params?.id ?? '')

    if (!drill) {
      return NextResponse.json({ error: 'Drill not found' }, { status: 404 })
    }

    // Get user's favorite status and progress
    const userId = session?.user?.id ?? ''
    const favorite = userId
      ? await prisma.favoriteDrill.findUnique({
          where: {
            userId_drillId: {
              userId,
              drillId: params?.id ?? '',
            },
          },
        })
      : null

    const progress = userId
      ? await prisma.userDrillProgress.findUnique({
          where: {
            userId_drillId: {
              userId,
              drillId: params?.id ?? '',
            },
          },
        })
      : null

    return NextResponse.json({
      success: true,
      drill: {
        ...drill,
        isFavorite: !!favorite,
        userProgress: progress,
      },
    })
  } catch (error) {
    console.error('Error fetching drill:', error)
    return NextResponse.json(
      { error: 'Failed to fetch drill' },
      { status: 500 }
    )
  }
}
