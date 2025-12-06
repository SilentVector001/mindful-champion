
import { NextResponse } from 'next/server';

export const dynamic = "force-dynamic";
import { prisma } from '@/lib/db';


export async function GET() {
  try {
    const products = await prisma.sponsorProduct.findMany({
      where: {
        isActive: true,
        isApproved: true,
      },
      include: {
        sponsor: {
          select: {
            companyName: true,
            logo: true,
          },
        },
      },
      orderBy: {
        pointsCost: 'asc',
      },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
