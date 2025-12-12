import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const TIER_LIMITS = {
  BRONZE: 0,
  SILVER: 5,
  GOLD: Infinity,
  PLATINUM: Infinity,
};

// GET - Fetch all products for current sponsor
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get sponsor profile
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { sponsorProfile: true },
    });

    if (!user?.sponsorProfile) {
      return NextResponse.json({ error: 'Sponsor profile not found' }, { status: 404 });
    }

    // Fetch products
    const products = await prisma.sponsorProduct.findMany({
      where: { sponsorId: user.sponsorProfile.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ products });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST - Create new product
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get sponsor profile
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { sponsorProfile: true },
    });

    if (!user?.sponsorProfile) {
      return NextResponse.json({ error: 'Sponsor profile not found' }, { status: 404 });
    }

    // Check tier limits
    const currentTier = user.sponsorProfile.partnershipTier;
    const tierLimit = TIER_LIMITS[currentTier as keyof typeof TIER_LIMITS];
    
    const productCount = await prisma.sponsorProduct.count({
      where: { sponsorId: user.sponsorProfile.id },
    });

    if (productCount >= tierLimit) {
      return NextResponse.json(
        { error: `Product limit reached for ${currentTier} tier. Upgrade to add more products.` },
        { status: 403 }
      );
    }

    // Parse request body
    const data = await req.json();

    // Validate required fields
    if (!data.name?.trim()) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }
    if (!data.description?.trim()) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }
    if (!data.category?.trim()) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }
    if (data.pointsCost < 1) {
      return NextResponse.json({ error: 'Point cost must be at least 1' }, { status: 400 });
    }
    if (data.retailValue < 0.01) {
      return NextResponse.json({ error: 'Retail value must be greater than 0' }, { status: 400 });
    }

    // Create product
    const product = await prisma.sponsorProduct.create({
      data: {
        sponsorId: user.sponsorProfile.id,
        name: data.name.trim(),
        description: data.description.trim(),
        category: data.category.trim(),
        imageUrl: data.imageUrl?.trim() || null,
        pointsCost: parseInt(data.pointsCost),
        retailValue: Math.round(parseFloat(String(data.retailValue)) * 100), // Store as cents
        stockQuantity: data.unlimitedStock ? 0 : parseInt(data.stockQuantity || 0),
        unlimitedStock: Boolean(data.unlimitedStock),
        isActive: Boolean(data.isActive),
        isApproved: true, // Auto-approve for now
        approvedAt: new Date(),
      },
    });

    console.log('✅ Product created:', product.id);

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}
