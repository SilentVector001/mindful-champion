import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Admin: Update a drill
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const drillId = params?.id ?? ''

    const existing = await prisma.drill.findUnique({
      where: { id: drillId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Drill not found' }, { status: 404 })
    }

    const updated = await prisma.drill.update({
      where: { id: drillId },
      data: body,
    })

    return NextResponse.json({
      success: true,
      drill: updated,
      message: 'Drill updated successfully',
    })
  } catch (error) {
    console.error('Error updating drill:', error)
    return NextResponse.json(
      { error: 'Failed to update drill' },
      { status: 500 }
    )
  }
}

// Admin: Delete a drill
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

    const existing = await prisma.drill.findUnique({
      where: { id: drillId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Drill not found' }, { status: 404 })
    }

    // Soft delete by setting active to false
    await prisma.drill.update({
      where: { id: drillId },
      data: { active: false },
    })

    return NextResponse.json({
      success: true,
      message: 'Drill deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting drill:', error)
    return NextResponse.json(
      { error: 'Failed to delete drill' },
      { status: 500 }
    )
  }
}
