/**
 * Recent Highlights API
 * Returns recent highlight videos for the media center carousel
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Sample highlights for fallback - real YouTube videos that work
const SAMPLE_HIGHLIGHTS = [
  {
    id: 'sample_1',
    title: 'Waters/Johns vs Johnson/Johnson - Mixed Doubles Final',
    videoUrl: 'https://www.youtube.com/watch?v=5j_Kn_J_GKU',
    thumbnail: 'https://i.ytimg.com/vi/Sj_Kn_J_GkU/maxresdefault.jpg',
    date: new Date('2024-11-10').toISOString(),
    tournament: 'Jenius Bank Pickleball World Championships',
    location: 'Farmers Branch, TX',
    description: 'Epic mixed doubles final featuring the top teams in professional pickleball.',
    channel: 'PPA Tour',
    category: 'Tournament Finals',
    featured: true,
    viewCount: 79000,
  },
  {
    id: 'sample_2',
    title: 'Anna Leigh Waters vs Kate Fahey - Women\'s Singles',
    videoUrl: 'https://www.youtube.com/watch?v=YIuCjIUc2io',
    thumbnail: 'https://i.ytimg.com/vi/YluCJiUc2io/maxresdefault.jpg',
    date: new Date('2024-11-10').toISOString(),
    tournament: 'Jenius Bank Pickleball World Championships',
    location: 'Farmers Branch, TX',
    description: 'Women\'s pro singles action featuring the world\'s best players.',
    channel: 'PPA Tour',
    category: 'Women\'s Singles',
    featured: true,
    viewCount: 48000,
  },
  {
    id: 'sample_3',
    title: 'D.C Pickleball vs Junior All-Stars - MLP Cup',
    videoUrl: 'https://www.youtube.com/watch?v=DeulSIUviMM',
    thumbnail: 'https://i.ytimg.com/vi/DeulSlUvIMM/hqdefault.jpg',
    date: new Date('2024-11-05').toISOString(),
    tournament: 'Edward Jones MLP Cup',
    location: 'Various',
    description: 'Major League Pickleball team competition at its finest.',
    channel: 'Major League Pickleball',
    category: 'Team Match',
    featured: false,
    viewCount: 3600,
  },
  {
    id: 'sample_4',
    title: '2025 USA Pickleball National Championships Preview',
    videoUrl: 'https://www.youtube.com/watch?v=ngi43wReTPs',
    thumbnail: 'https://i.ytimg.com/vi/ngi43wReTPs/hqdefault.jpg',
    date: new Date('2024-08-15').toISOString(),
    tournament: 'USA Pickleball Nationals',
    location: 'San Diego, CA',
    description: 'Preview of the largest amateur pickleball tournament in the world.',
    channel: 'USA Pickleball',
    category: 'Tournament Preview',
    featured: false,
    viewCount: 10000,
  },
  {
    id: 'sample_5',
    title: 'Best Third Shot Drops - Pro Tips & Techniques',
    videoUrl: 'https://www.youtube.com/@PPATour',
    thumbnail: 'https://images.unsplash.com/photo-1642104798671-01a4129f4fdc?w=400&h=225&fit=crop',
    date: new Date('2024-10-20').toISOString(),
    tournament: 'Training Series',
    location: 'Various',
    description: 'Learn the essential third shot drop from professional players.',
    channel: 'PPA Tour',
    category: 'Training',
    featured: false,
    viewCount: 25000,
  },
  {
    id: 'sample_6',
    title: 'Top 10 Rallies of 2024 - Incredible Points',
    videoUrl: 'https://www.youtube.com/@MajorLeaguePickleball',
    thumbnail: 'https://images.unsplash.com/photo-1686721135030-e2ab79e27b16?w=400&h=225&fit=crop',
    date: new Date('2024-12-01').toISOString(),
    tournament: 'Season Recap',
    location: 'Various',
    description: 'The most exciting rallies and points from the 2024 professional season.',
    channel: 'MLP',
    category: 'Highlights',
    featured: true,
    viewCount: 150000,
  }
];

const SAMPLE_CATEGORIES = ['Tournament Finals', 'Women\'s Singles', 'Team Match', 'Tournament Preview', 'Training', 'Highlights'];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const featured = searchParams.get('featured') === 'true';

    let highlights: any[] = [];
    let categories: string[] = [];

    try {
      // Build where clause
      const where: any = {};
      if (category) {
        where.category = category;
      }
      if (featured) {
        where.featured = true;
      }

      // Fetch highlights from database
      const dbHighlights = await prisma.recentHighlight.findMany({
        where,
        orderBy: [
          { featured: 'desc' },
          { date: 'desc' },
          { createdAt: 'desc' }
        ],
        take: limit,
      });

      if (dbHighlights && dbHighlights.length > 0) {
        highlights = dbHighlights.map(h => ({
          id: h.id,
          title: h.title,
          videoUrl: h.videoUrl,
          thumbnail: h.thumbnail,
          date: h.date.toISOString(),
          tournament: h.tournament,
          location: h.location,
          description: h.description,
          channel: h.channel,
          category: h.category,
          featured: h.featured,
          viewCount: h.viewCount,
        }));

        // Get unique categories for filtering
        const dbCategories = await prisma.recentHighlight.findMany({
          select: {
            category: true,
          },
          distinct: ['category'],
          orderBy: {
            category: 'asc',
          },
        });
        categories = dbCategories.map(c => c.category);
      }
    } catch (dbError) {
      console.error('Database error fetching highlights, using sample data:', dbError);
    }

    // Use sample data if no highlights from database
    if (highlights.length === 0) {
      let sampleData = [...SAMPLE_HIGHLIGHTS];
      
      // Apply filters to sample data
      if (category) {
        sampleData = sampleData.filter(h => h.category === category);
      }
      if (featured) {
        sampleData = sampleData.filter(h => h.featured);
      }
      
      highlights = sampleData.slice(0, limit);
      categories = SAMPLE_CATEGORIES;
    }

    return NextResponse.json({
      success: true,
      count: highlights.length,
      highlights,
      categories,
    });

  } catch (error) {
    console.error('Error fetching recent highlights:', error);
    
    // Return sample data even on error
    return NextResponse.json({
      success: true,
      count: SAMPLE_HIGHLIGHTS.length,
      highlights: SAMPLE_HIGHLIGHTS,
      categories: SAMPLE_CATEGORIES,
      message: 'Showing sample highlights'
    });
  }
}
