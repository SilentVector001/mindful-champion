import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Get sponsor analytics
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sponsorProfile = await prisma.sponsorProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        offers: {
          include: {
            _count: { select: { redemptions: true } }
          }
        }
      }
    });

    if (!sponsorProfile || !sponsorProfile.isApproved) {
      return NextResponse.json(
        { error: 'Sponsor profile not found or not approved' },
        { status: 403 }
      );
    }

    // Calculate comprehensive analytics
    const totalOffers = sponsorProfile.offers.length;
    const activeOffers = sponsorProfile.offers.filter(o => o.status === 'ACTIVE').length;
    const totalViews = sponsorProfile.offers.reduce((sum, o) => sum + o.viewCount, 0);
    const totalClicks = sponsorProfile.offers.reduce((sum, o) => sum + o.clickCount, 0);
    const totalRedemptions = sponsorProfile.offers.reduce((sum, o) => sum + o.redemptionCount, 0);
    const totalValue = sponsorProfile.offers.reduce((sum, o) => sum + (o.retailValue * o.redemptionCount), 0);
    const avgConversionRate = totalViews > 0 ? ((totalRedemptions / totalViews) * 100).toFixed(2) : '0';

    // Get redemption details
    const redemptions = await prisma.offerRedemption.findMany({
      where: { sponsorId: sponsorProfile.id },
      include: {
        offer: { select: { title: true } },
        user: { select: { email: true, firstName: true, lastName: true, skillLevel: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    // Group redemptions by status
    const redemptionsByStatus = {
      pending: redemptions.filter(r => r.status === 'PENDING').length,
      processing: redemptions.filter(r => r.status === 'PROCESSING').length,
      shipped: redemptions.filter(r => r.status === 'SHIPPED').length,
      delivered: redemptions.filter(r => r.status === 'DELIVERED').length,
      cancelled: redemptions.filter(r => r.status === 'CANCELLED').length,
    };

    // Performance by offer
    const offerPerformance = sponsorProfile.offers
      .map(offer => ({
        id: offer.id,
        title: offer.title,
        status: offer.status,
        views: offer.viewCount,
        clicks: offer.clickCount,
        redemptions: offer.redemptionCount,
        conversionRate: offer.viewCount > 0 ? ((offer.redemptionCount / offer.viewCount) * 100).toFixed(2) : '0',
        revenue: offer.retailValue * offer.redemptionCount,
        pointsCost: offer.pointsCost,
        retailValue: offer.retailValue
      }))
      .sort((a, b) => b.redemptions - a.redemptions);

    const analytics = {
      overview: {
        totalOffers,
        activeOffers,
        totalViews,
        totalClicks,
        totalRedemptions,
        totalValue,
        avgConversionRate,
        tier: sponsorProfile.partnershipTier,
        maxActiveOffers: sponsorProfile.maxActiveOffers
      },
      redemptions: {
        total: totalRedemptions,
        byStatus: redemptionsByStatus,
        recent: redemptions.slice(0, 10)
      },
      offers: {
        performance: offerPerformance,
        topPerforming: offerPerformance.slice(0, 5)
      }
    };

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
