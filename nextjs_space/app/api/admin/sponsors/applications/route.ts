import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { SponsorApplicationStatus, SponsorTier } from '@/lib/prisma-types';

export const dynamic = 'force-dynamic';

// Get all applications (admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as SponsorApplicationStatus | null;

    const where: any = {};
    if (status) where.status = status;

    const applications = await prisma.sponsorApplication.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    const stats = {
      total: applications.length,
      pending: applications.filter(a => a.status === 'PENDING').length,
      underReview: applications.filter(a => a.status === 'UNDER_REVIEW').length,
      approved: applications.filter(a => a.status === 'APPROVED').length,
      rejected: applications.filter(a => a.status === 'REJECTED').length,
    };

    return NextResponse.json({ applications, stats });
  } catch (error) {
    console.error('Get applications error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}
