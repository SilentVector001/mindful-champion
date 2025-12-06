
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10');

    const videos = await prisma.youTubeVideo.findMany({
      where: {
        isActive: true,
        ...(featured && { featured: true }),
      },
      orderBy: [
        { featured: 'desc' },
        { orderIndex: 'asc' },
        { publishedAt: 'desc' },
      ],
      take: limit,
    });

    return NextResponse.json({ success: true, videos });
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}
