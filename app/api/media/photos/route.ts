import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET - List all photos
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request?.url || '');
    const category = searchParams?.get('category');
    const featured = searchParams?.get('featured');

    const where: any = {};

    if (category && category !== 'all') {
      where.category = category?.toLowerCase();
    }

    if (featured === 'true') {
      where.featured = true;
    }

    const photos = await prisma?.mediaPhoto?.findMany({
      where,
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 100
    });

    return NextResponse.json({
      success: true,
      photos: photos || []
    });
  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}

// POST - Upload a new photo (admin only)
export async function POST(request: Request) {
  try {
    const body = await request?.json();
    
    const {
      title,
      description,
      url,
      category,
      tags,
      tournamentId,
      uploadedBy,
      uploadedByName,
      featured
    } = body || {};

    if (!title || !url || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const photo = await prisma?.mediaPhoto?.create({
      data: {
        title,
        description: description || null,
        url,
        category: category?.toLowerCase(),
        tags: tags || null,
        tournamentId: tournamentId || null,
        uploadedBy: uploadedBy || 'admin',
        uploadedByName: uploadedByName || 'Admin',
        featured: featured || false
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Photo uploaded successfully',
      photo
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload photo' },
      { status: 500 }
    );
  }
}
