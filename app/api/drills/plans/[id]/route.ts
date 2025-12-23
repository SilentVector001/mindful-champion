import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Update a custom drill plan
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, drillIds } = body ?? {}

    const userId = session?.user?.id ?? ''
    const planId = params?.id ?? ''

    // Check if plan exists and belongs to user
    const existingPlan = await prisma.customDrillPlan.findUnique({
      where: { id: planId },
    })

    if (!existingPlan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    if (existingPlan?.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // If drillIds provided, update the drills
    if (drillIds && Array.isArray(drillIds)) {
      // Delete existing drill associations
      await prisma.customDrillPlanDrill.deleteMany({
        where: { planId },
      })

      // Create new associations
      await prisma.customDrillPlanDrill.createMany({
        data: drillIds?.map((drillId: string, index: number) => ({
          planId,
          drillId,
          order: index,
        })) ?? [],
      })

      // Recalculate total duration
      const drills = await prisma.drill.findMany({
        where: { id: { in: drillIds } },
        select: { duration: true },
      })

      const totalDuration = drills?.reduce((sum, d) => sum + (d?.duration ?? 0), 0) ?? 0

      // Update plan
      const updated = await prisma.customDrillPlan.update({
        where: { id: planId },
        data: {
          name: name ?? existingPlan?.name,
          description: description !== undefined ? description : existingPlan?.description,
          totalDuration,
        },
        include: {
          drills: {
            include: {
              drill: true,
            },
            orderBy: { order: 'asc' },
          },
        },
      })

      return NextResponse.json({
        success: true,
        plan: updated,
        message: 'Plan updated successfully',
      })
    } else {
      // Just update name/description
      const updated = await prisma.customDrillPlan.update({
        where: { id: planId },
        data: {
          name: name ?? existingPlan?.name,
          description: description !== undefined ? description : existingPlan?.description,
        },
        include: {
          drills: {
            include: {
              drill: true,
            },
            orderBy: { order: 'asc' },
          },
        },
      })

      return NextResponse.json({
        success: true,
        plan: updated,
        message: 'Plan updated successfully',
      })
    }
  } catch (error) {
    console.error('Error updating plan:', error)
    return NextResponse.json(
      { error: 'Failed to update plan' },
      { status: 500 }
    )
  }
}

// Delete a custom drill plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session?.user?.id ?? ''
    const planId = params?.id ?? ''

    // Check if plan exists and belongs to user
    const existingPlan = await prisma.customDrillPlan.findUnique({
      where: { id: planId },
    })

    if (!existingPlan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    if (existingPlan?.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete plan (cascades to drill associations)
    await prisma.customDrillPlan.delete({
      where: { id: planId },
    })

    return NextResponse.json({
      success: true,
      message: 'Plan deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting plan:', error)
    return NextResponse.json(
      { error: 'Failed to delete plan' },
      { status: 500 }
    )
  }
}
