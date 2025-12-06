
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET: Fetch all active podcast shows
export async function GET() {
  try {
    const shows = await prisma.podcastShow.findMany({
      where: { isActive: true },
      include: {
        episodes: {
          take: 3,
          orderBy: { publishDate: 'desc' },
        },
      },
      orderBy: { title: 'asc' },
    });

    return NextResponse.json({ shows });
  } catch (error) {
    console.error('Error fetching podcast shows:', error);
    return NextResponse.json(
      { error: 'Failed to fetch podcast shows' },
      { status: 500 }
    );
  }
}
