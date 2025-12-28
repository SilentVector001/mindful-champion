
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { UserRole } from '@/lib/prisma-types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession();

    // Check if user is admin
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!admin || admin.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Get SMS statistics
    const [
      totalSMSSent,
      totalUsersWithPhone,
      totalVerifiedPhones,
      total2FAEnabled,
      smsLastHour,
      smsToday,
    ] = await Promise.all([
      // Total SMS sent
      prisma.sMSVerificationCode.count(),
      
      // Users with phone number
      prisma.user.count({
        where: {
          phoneNumber: { not: null },
        },
      }),
      
      // Verified phone numbers
      prisma.user.count({
        where: {
          phoneNumberVerified: true,
        },
      }),
      
      // 2FA enabled users
      prisma.user.count({
        where: {
          twoFactorEnabled: true,
        },
      }),
      
      // SMS sent in last hour
      prisma.sMSVerificationCode.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 60 * 60 * 1000),
          },
        },
      }),
      
      // SMS sent today
      prisma.sMSVerificationCode.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    // Get SMS by type
    const smsByType = await prisma.sMSVerificationCode.groupBy({
      by: ['type'],
      _count: {
        id: true,
      },
    });

    // Get success rate (used codes / total codes)
    const usedCodes = await prisma.sMSVerificationCode.count({
      where: { used: true },
    });

    const successRate = totalSMSSent > 0 
      ? ((usedCodes / totalSMSSent) * 100).toFixed(2) 
      : '0.00';

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalSMSSent,
          totalUsersWithPhone,
          totalVerifiedPhones,
          total2FAEnabled,
          smsLastHour,
          smsToday,
          successRate: `${successRate}%`,
        },
        byType: smsByType.reduce((acc: any, item: any) => {
          acc[item.type] = item._count.id;
          return acc;
        }, {} as Record<string, number>),
      },
    });
    
  } catch (error) {
    console.error('Get SMS stats error:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
