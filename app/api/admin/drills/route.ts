import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Admin: Create a new drill (not supported for static drills)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Static drills cannot be created via API
    return NextResponse.json({
      error: 'Static drills cannot be created via API. To add custom drills, please implement database-backed drills.',
    }, { status: 501 })
  } catch (error) {
    console.error('Error creating drill:', error)
    return NextResponse.json(
      { error: 'Failed to create drill' },
      { status: 500 }
    )
  }
}
