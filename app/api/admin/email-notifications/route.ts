
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { EmailStatus, EmailNotificationType } from '@prisma/client'

/**
 * GET /api/admin/email-notifications
 * List all email notifications with filters
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') as EmailStatus | null
    const type = searchParams.get('type') as EmailNotificationType | null
    const search = searchParams.get('search') || ''
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    const skip = (page - 1) * limit
    
    // Build where clause
    const where: any = {}
    
    if (status) {
      where.status = status
    }
    
    if (type) {
      where.type = type
    }
    
    if (search) {
      where.OR = [
        { recipientEmail: { contains: search, mode: 'insensitive' } },
        { recipientName: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }
    
    // Get notifications with pagination
    const [notifications, total] = await Promise.all([
      prisma.emailNotification.findMany({
        where,
        select: {
          id: true,
          recipientEmail: true,
          recipientName: true,
          subject: true,
          htmlContent: true,
          status: true,
          type: true,
          sentAt: true,
          createdAt: true,
          error: true,
          retryCount: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          videoAnalysis: {
            select: {
              id: true,
              title: true,
              overallScore: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.emailNotification.count({ where }),
    ])
    
    return NextResponse.json({
      notifications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('Error fetching email notifications:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}
