import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { SponsorOfferStatus } from '@prisma/client';

// Get offers (for sponsors to see their own or users to browse marketplace)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    
    const sponsorView = searchParams.get('sponsorView') === 'true';
    const category = searchParams.get('category');
    const status = searchParams.get('status') as SponsorOfferStatus | null;
    const featured = searchParams.get('featured') === 'true';

    if (sponsorView) {
      // Sponsors viewing their own offers
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const sponsorProfile = await prisma.sponsorProfile.findUnique({
        where: { userId: session.user.id }
      });

      if (!sponsorProfile) {
        return NextResponse.json({ error: 'No sponsor profile found' }, { status: 404 });
      }

      const where: any = { sponsorId: sponsorProfile.id };
      if (status) where.status = status;
      if (category) where.category = category;

      const offers = await prisma.sponsorOffer.findMany({
        where,
        include: {
          sponsor: {
            select: {
              companyName: true,
              logo: true,
              partnershipTier: true
            }
          },
          _count: {
            select: { redemptions: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return NextResponse.json({ offers });
    } else {
      // Public marketplace view
      const where: any = {
        status: 'ACTIVE',
        isApproved: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() }
      };

      if (category) where.category = category;
      if (featured) where.isFeatured = true;

      const offers = await prisma.sponsorOffer.findMany({
        where,
        include: {
          sponsor: {
            select: {
              companyName: true,
              logo: true,
              partnershipTier: true,
              website: true
            }
          }
        },
        orderBy: [
          { isFeatured: 'desc' },
          { isPriority: 'desc' },
          { viewCount: 'desc' }
        ],
        take: 50
      });

      return NextResponse.json({ offers });
    }
  } catch (error) {
    console.error('Get offers error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch offers' },
      { status: 500 }
    );
  }
}

// Create new offer (sponsors only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sponsorProfile = await prisma.sponsorProfile.findUnique({
      where: { userId: session.user.id },
      include: { offers: { where: { status: 'ACTIVE' } } }
    });

    if (!sponsorProfile || !sponsorProfile.isApproved) {
      return NextResponse.json(
        { error: 'Sponsor profile not approved' },
        { status: 403 }
      );
    }

    // Check if sponsor has reached max active offers limit
    if (sponsorProfile.offers.length >= sponsorProfile.maxActiveOffers) {
      return NextResponse.json(
        { 
          error: `You have reached your limit of ${sponsorProfile.maxActiveOffers} active offers. Upgrade your tier for more.`,
          needsUpgrade: true
        },
        { status: 403 }
      );
    }

    const data = await req.json();

    const offer = await prisma.sponsorOffer.create({
      data: {
        sponsorId: sponsorProfile.id,
        title: data.title,
        description: data.description,
        shortDescription: data.shortDescription,
        terms: data.terms,
        imageUrl: data.imageUrl,
        thumbnailUrl: data.thumbnailUrl,
        bannerUrl: data.bannerUrl,
        brandColor: data.brandColor || sponsorProfile.logo,
        pointsCost: parseInt(data.pointsCost),
        retailValue: parseInt(data.retailValue),
        discountPercent: data.discountPercent ? parseInt(data.discountPercent) : null,
        promoCode: data.promoCode,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: 'DRAFT',
        stockQuantity: data.stockQuantity ? parseInt(data.stockQuantity) : null,
        unlimitedStock: data.unlimitedStock || false,
        maxRedemptionsPerUser: parseInt(data.maxRedemptionsPerUser) || 1,
        maxTotalRedemptions: data.maxTotalRedemptions ? parseInt(data.maxTotalRedemptions) : null,
        achievementBonusPoints: data.achievementBonusPoints ? parseInt(data.achievementBonusPoints) : null,
        linkedAchievementId: data.linkedAchievementId,
        minAchievementPoints: data.minAchievementPoints ? parseInt(data.minAchievementPoints) : null,
        requiredSkillLevel: data.requiredSkillLevel,
        category: data.category,
        subcategory: data.subcategory,
        tags: data.tags || [],
        targetAudience: data.targetAudience || {},
        exclusiveToTier: data.exclusiveToTier,
      },
    });

    return NextResponse.json({
      success: true,
      offer,
      message: 'Offer created successfully! It will be reviewed before going live.'
    });
  } catch (error) {
    console.error('Create offer error:', error);
    return NextResponse.json(
      { error: 'Failed to create offer' },
      { status: 500 }
    );
  }
}
