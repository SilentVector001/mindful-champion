import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Approve/reject/feature offer (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ offerId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { offerId } = await params;
    const data = await req.json();

    const updateData: any = {};

    // Handle approval
    if (data.isApproved !== undefined) {
      updateData.isApproved = data.isApproved;
      if (data.isApproved) {
        updateData.approvedAt = new Date();
        updateData.approvedBy = session.user.id;
        updateData.rejectionReason = null;
      } else {
        updateData.approvedAt = null;
        updateData.approvedBy = null;
        updateData.rejectionReason = data.rejectionReason;
      }
    }

    // Handle featuring
    if (data.isFeatured !== undefined) {
      updateData.isFeatured = data.isFeatured;
    }

    // Handle priority
    if (data.isPriority !== undefined) {
      updateData.isPriority = data.isPriority;
    }

    // Handle status change
    if (data.status) {
      updateData.status = data.status;
    }

    // Admin notes
    if (data.adminNotes !== undefined) {
      updateData.adminNotes = data.adminNotes;
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
