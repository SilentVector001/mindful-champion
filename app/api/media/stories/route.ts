import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET - List all approved community stories
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request?.url || '');
    const category = searchParams?.get('category');
    const featured = searchParams?.get('featured');

    const where: any = {
      approved: true
    };

    if (category && category !== 'all') {
      where.category = category;
    }

    if (featured === 'true') {
      where.featured = true;
    }

    const stories = await prisma?.communityStory?.findMany({
      where,
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 50
    });

    return NextResponse.json({
      success: true,
      stories: stories || []
    });
  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stories' },
      { status: 500 }
    );
  }
}

// POST - Submit a new community story
export async function POST(request: Request) {
  try {
    const body = await request?.json();
    
    const { title, content, authorName, authorEmail, location, skillLevel, category } = body || {};

    if (!title || !content || !authorName || !authorEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create excerpt from content (first 200 chars)
    const excerpt = content?.substring(0, 200) + (content?.length > 200 ? '...' : '');

    const story = await prisma?.communityStory?.create({
      data: {
        title,
        content,
        excerpt,
        authorName,
        authorEmail,
        location: location || null,
        skillLevel: skillLevel || null,
        category: category || 'success',
        approved: false, // Stories require admin approval
        featured: false
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Story submitted successfully! It will be reviewed by our team.',
      story
    });
  } catch (error) {
    console.error('Error creating story:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit story' },
      { status: 500 }
    );
  }
}
