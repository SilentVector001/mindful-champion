import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Get user's custom drill plans
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session?.user?.id ?? ''
    const plans = await prisma.customDrillPlan.findMany({
      where: { userId },
      include: {
        drills: {
          include: {
            drill: true,
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      plans,
      total: plans?.length ?? 0,
    })
  } catch (error) {
    console.error('Error fetching plans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    )
  }
}

// Create a new custom drill plan
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, drillIds } = body ?? {}

    if (!name || !drillIds || !Array.isArray(drillIds) || drillIds?.length === 0) {
      return NextResponse.json(
        { error: 'Name and drill IDs are required' },
        { status: 400 }
      )
    }

    const userId = session?.user?.id ?? ''

    // Calculate total duration
    const drills = await prisma.drill.findMany({
      where: { id: { in: drillIds } },
      select: { id: true, duration: true },
    })

    const totalDuration = drills?.reduce((sum, d) => sum + (d?.duration ?? 0), 0) ?? 0

    // Create plan with drills
    const plan = await prisma.customDrillPlan.create({
      data: {
        userId,
        name,
        description: description ?? null,
        totalDuration,
        drills: {
          create: drillIds?.map((drillId: string, index: number) => ({
            drillId,
            order: index,
          })) ?? [],
        },
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
      plan,
      message: 'Custom drill plan created successfully',
    })
  } catch (error) {
    console.error('Error creating plan:', error)
    return NextResponse.json(
      { error: 'Failed to create plan' },
      { status: 500 }
    )
  }
}
