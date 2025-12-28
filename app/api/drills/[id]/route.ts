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

    // Note: Favorites and progress features not implemented yet
    // These require FavoriteDrill and UserDrillProgress models in the database
    return NextResponse.json({
      success: true,
      drill: {
        ...drill,
        isFavorite: false,
        userProgress: null,
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
