import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// PATCH - Update product
export async function PATCH(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { sponsorProfile: true },
    });

    if (!user?.sponsorProfile) {
      return NextResponse.json({ error: 'Sponsor profile not found' }, { status: 404 });
    }

    // Verify product ownership
    const product = await prisma.sponsorProduct.findFirst({
      where: {
        id: params.productId,
        sponsorId: user.sponsorProfile.id,
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Parse update data
    const data = await req.json();

    // Update product
    const updated = await prisma.sponsorProduct.update({
      where: { id: params.productId },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.description && { description: data.description.trim() }),
        ...(data.category && { category: data.category.trim() }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl?.trim() || null }),
        ...(data.pointsCost && { pointsCost: parseInt(data.pointsCost) }),
        ...(data.retailValue && { retailValue: Math.round(parseFloat(String(data.retailValue)) * 100) }),
        ...(data.stockQuantity !== undefined && { stockQuantity: parseInt(data.stockQuantity) }),
        ...(data.unlimitedStock !== undefined && { unlimitedStock: Boolean(data.unlimitedStock) }),
        ...(data.isActive !== undefined && { isActive: Boolean(data.isActive) }),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE - Delete product
export async function DELETE(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { sponsorProfile: true },
    });

    if (!user?.sponsorProfile) {
      return NextResponse.json({ error: 'Sponsor profile not found' }, { status: 404 });
    }

    // Verify product ownership
    const product = await prisma.sponsorProduct.findFirst({
      where: {
        id: params.productId,
        sponsorId: user.sponsorProfile.id,
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Delete product
    await prisma.sponsorProduct.delete({
      where: { id: params.productId },
    });

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
