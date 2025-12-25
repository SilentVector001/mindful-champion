import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDrillById } from '@/lib/drills-data'

export const dynamic = 'force-dynamic'

// Admin: Update a drill (not supported for static drills)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const drillId = params?.id ?? ''
    const existing = getDrillById(drillId)

    if (!existing) {
      return NextResponse.json({ error: 'Drill not found' }, { status: 404 })
    }

    // Static drills cannot be modified
    return NextResponse.json({
      error: 'Static drills cannot be modified. To add custom drills, please implement database-backed drills.',
    }, { status: 501 })
  } catch (error) {
    console.error('Error updating drill:', error)
    return NextResponse.json(
      { error: 'Failed to update drill' },
      { status: 500 }
    )
  }
}

// Admin: Delete a drill (not supported for static drills)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const drillId = params?.id ?? ''
    const existing = getDrillById(drillId)

    if (!existing) {
      return NextResponse.json({ error: 'Drill not found' }, { status: 404 })
    }

    // Static drills cannot be deleted
    return NextResponse.json({
      error: 'Static drills cannot be deleted. To add custom drills, please implement database-backed drills.',
    }, { status: 501 })
  } catch (error) {
    console.error('Error deleting drill:', error)
    return NextResponse.json(
      { error: 'Failed to delete drill' },
      { status: 500 }
    )
  }
}
