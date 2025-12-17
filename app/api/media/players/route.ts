import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET - List all player spotlights
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request?.url || '');
    const featured = searchParams?.get('featured');

    const where: any = {};

    if (featured === 'true') {
      where.featured = true;
    }

    const players = await prisma?.playerSpotlight?.findMany({
      where,
      orderBy: [
        { featured: 'desc' },
        { displayOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({
      success: true,
      players: players || []
    });
  } catch (error) {
    console.error('Error fetching players:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch players' },
      { status: 500 }
    );
  }
}

// POST - Create a new player spotlight (admin only)
export async function POST(request: Request) {
  try {
    const body = await request?.json();
    
    const {
      name,
      photoUrl,
      ranking,
      rating,
      bio,
      achievements,
      stats,
      socialLinks,
      organization,
      featured,
      displayOrder
    } = body || {};

    if (!name || !photoUrl || !bio) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const player = await prisma?.playerSpotlight?.create({
      data: {
        name,
        photoUrl,
        ranking: ranking || null,
        rating: rating || null,
        bio,
        achievements: achievements || null,
        stats: stats || null,
        socialLinks: socialLinks || null,
        organization: organization || null,
        featured: featured || false,
        displayOrder: displayOrder || 0
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Player spotlight created successfully',
      player
    });
  } catch (error) {
    console.error('Error creating player spotlight:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create player spotlight' },
      { status: 500 }
    );
  }
}
