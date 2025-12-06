
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's video analyses with pagination
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Optional status filter
    const statusFilter = searchParams.get('status')
    const whereClause: any = { userId: session.user.id }
    
    if (statusFilter && ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'].includes(statusFilter)) {
      whereClause.analysisStatus = statusFilter
    }

    const [analyses, total] = await Promise.all([
      prisma.videoAnalysis.findMany({
        where: whereClause,
        orderBy: { uploadedAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          fileName: true,
          videoUrl: true,
          title: true,
          overallScore: true,
          technicalScores: true,
          movementMetrics: true,
          strengths: true,
          areasForImprovement: true,
          uploadedAt: true,
          analysisStatus: true,
          analyzedAt: true,
        },
      }),
      prisma.videoAnalysis.count({
        where: whereClause,
      }),
    ])

    return NextResponse.json({
      analyses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('Library fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch library' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const analysisId = searchParams.get('id')

    if (!analysisId) {
      return NextResponse.json(
        { error: 'Analysis ID is required' },
        { status: 400 }
      )
    }

    // Delete analysis (only if it belongs to the user)
    await prisma.videoAnalysis.deleteMany({
      where: {
        id: analysisId,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete analysis' },
      { status: 500 }
    )
  }
}
