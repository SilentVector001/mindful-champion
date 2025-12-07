
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { PromoCodeStatus } from '@/lib/prisma-types';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const assignedTo = searchParams.get('assignedTo');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {};
    
    if (status && status !== 'ALL') {
      where.status = status as PromoCodeStatus;
    }

    if (assignedTo && assignedTo !== 'ALL') {
      where.assignedTo = assignedTo;
    }

    const [codes, total] = await Promise.all([
      prisma.promoCode.findMany({
        where,
        include: {
          redeemedByUser: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          betaTesters: {
            select: {
              id: true,
              status: true,
              totalTasksCompleted: true,
              totalTasksRequired: true,
              rewardEligible: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.promoCode.count({ where })
    ]);

    // Get summary statistics
    const stats = await prisma.promoCode.groupBy({
      by: ['status'],
      _count: true
    });

    return NextResponse.json({
      codes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      stats: stats.reduce((acc: any, stat: any) => {
        acc[stat.status] = stat._count;
        return acc;
      }, {})
    });

  } catch (error) {
    console.error('Error fetching promo codes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch promo codes' },
      { status: 500 }
    );
  }
}

// Update promo code status
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { codeId, status } = await req.json();

    if (!codeId || !status) {
      return NextResponse.json(
        { error: 'Code ID and status are required' },
        { status: 400 }
      );
    }

    const updated = await prisma.promoCode.update({
      where: { id: codeId },
      data: { status: status as PromoCodeStatus }
    });

    return NextResponse.json({
      success: true,
      code: updated
    });

  } catch (error) {
    console.error('Error updating promo code:', error);
    return NextResponse.json(
      { error: 'Failed to update promo code' },
      { status: 500 }
    );
  }
}
