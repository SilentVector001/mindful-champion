import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { SponsorOfferStatus } from '@prisma/client';

// Get single offer
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ offerId: string }> }
) {
  try {
    const { offerId } = await params;

    const offer = await prisma.sponsorOffer.findUnique({
      where: { id: offerId },
      include: {
        sponsor: {
          select: {
            companyName: true,
            logo: true,
            website: true,
            partnershipTier: true,
            description: true
          }
        },
        _count: {
          select: { redemptions: true }
        }
      }
    });

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    // Increment view count (only for active, public offers)
    if (offer.status === 'ACTIVE' && offer.isApproved) {
      await prisma.sponsorOffer.update({
        where: { id: offerId },
        data: { viewCount: { increment: 1 } }
      });
    }

    return NextResponse.json({ offer });
  } catch (error) {
    console.error('Get offer error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch offer' },
      { status: 500 }
    );
  }
}

// Update offer (sponsor only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ offerId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { offerId } = await params;
    const data = await req.json();

    // Verify ownership
    const existingOffer = await prisma.sponsorOffer.findUnique({
      where: { id: offerId },
      include: { sponsor: true }
    });

    if (!existingOffer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    if (existingOffer.sponsor.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Prepare update data
    const updateData: any = {};
    const allowedFields = [
      'title', 'description', 'shortDescription', 'terms',
      'imageUrl', 'thumbnailUrl', 'bannerUrl', 'brandColor',
      'pointsCost', 'retailValue', 'discountPercent', 'promoCode',
      'startDate', 'endDate', 'status',
      'stockQuantity', 'unlimitedStock', 'maxRedemptionsPerUser', 'maxTotalRedemptions',
      'achievementBonusPoints', 'linkedAchievementId', 'minAchievementPoints', 'requiredSkillLevel',
      'category', 'subcategory', 'tags', 'targetAudience', 'exclusiveToTier'
    ];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        if (['pointsCost', 'retailValue', 'discountPercent', 'stockQuantity', 'maxRedemptionsPerUser', 'maxTotalRedemptions', 'achievementBonusPoints', 'minAchievementPoints'].includes(field)) {
          updateData[field] = parseInt(data[field]);
        } else if (['startDate', 'endDate'].includes(field)) {
          updateData[field] = new Date(data[field]);
        } else {
          updateData[field] = data[field];
        }
      }
    }

    // If changing to ACTIVE from DRAFT, reset approval
    if (data.status === 'ACTIVE' && existingOffer.status === 'DRAFT') {
      updateData.isApproved = false;
      updateData.approvedAt = null;
      updateData.approvedBy = null;
    }

    const updatedOffer = await prisma.sponsorOffer.update({
      where: { id: offerId },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      offer: updatedOffer,
      message: 'Offer updated successfully'
    });
  } catch (error) {
    console.error('Update offer error:', error);
    return NextResponse.json(
      { error: 'Failed to update offer' },
      { status: 500 }
    );
  }
}

// Delete offer (sponsor only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ offerId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { offerId } = await params;

    // Verify ownership
    const existingOffer = await prisma.sponsorOffer.findUnique({
      where: { id: offerId },
      include: { 
        sponsor: true,
        _count: { select: { redemptions: true } }
      }
    });

    if (!existingOffer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    if (existingOffer.sponsor.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Don't allow deletion if there are active redemptions
    if (existingOffer._count.redemptions > 0) {
      return NextResponse.json(
        { error: 'Cannot delete offer with existing redemptions. Archive it instead.' },
        { status: 400 }
      );
    }

    await prisma.sponsorOffer.delete({
      where: { id: offerId }
    });

    return NextResponse.json({
      success: true,
      message: 'Offer deleted successfully'
    });
  } catch (error) {
    console.error('Delete offer error:', error);
    return NextResponse.json(
      { error: 'Failed to delete offer' },
      { status: 500 }
    );
  }
}
