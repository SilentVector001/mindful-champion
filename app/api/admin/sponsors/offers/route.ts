import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Get all offers (admin view with filtering)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const sponsorId = searchParams.get('sponsorId');
    const isApproved = searchParams.get('isApproved');
    const category = searchParams.get('category');

    const where: any = {};
    if (status) where.status = status;
    if (sponsorId) where.sponsorId = sponsorId;
    if (isApproved !== null) where.isApproved = isApproved === 'true';
    if (category) where.category = category;

    const offers = await prisma.sponsorOffer.findMany({
      where,
      include: {
        sponsor: {
          select: {
            companyName: true,
            logo: true,
            partnershipTier: true,
            contactEmail: true
          }
        },
        _count: {
          select: { redemptions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const stats = {
      total: offers.length,
      pending: offers.filter(o => !o.isApproved && o.status === 'DRAFT').length,
      active: offers.filter(o => o.status === 'ACTIVE' && o.isApproved).length,
      paused: offers.filter(o => o.status === 'PAUSED').length,
      expired: offers.filter(o => o.status === 'EXPIRED').length,
      totalRedemptions: offers.reduce((sum, o) => sum + o.redemptionCount, 0),
      totalValue: offers.reduce((sum, o) => sum + (o.retailValue * o.redemptionCount), 0)
    };

    return NextResponse.json({ offers, stats });
  } catch (error) {
    console.error('Get offers error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch offers' },
      { status: 500 }
    );
  }
}
