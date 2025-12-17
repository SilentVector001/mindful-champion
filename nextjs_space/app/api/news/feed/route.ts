
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET: Fetch latest pickleball news
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};
    if (category && category !== 'ALL') {
      where.category = category;
    }

    const news = await prisma.newsItem.findMany({
      where,
      orderBy: { publishDate: 'desc' },
      take: limit,
    });

    return NextResponse.json({ news });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

// POST: Increment view count for a news item
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { newsId } = body;

    if (!newsId) {
      return NextResponse.json(
        { error: 'News ID is required' },
        { status: 400 }
      );
    }

    await prisma.newsItem.update({
      where: { id: newsId },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating news view count:', error);
    return NextResponse.json(
      { error: 'Failed to update view count' },
      { status: 500 }
    );
  }
}
