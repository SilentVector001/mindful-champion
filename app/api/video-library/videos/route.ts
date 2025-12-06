
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Pickleball-specific keywords for content validation
const PICKLEBALL_KEYWORDS = [
  'pickleball', 'dink', 'kitchen', 'erne', 'third shot', 'paddle', 
  'non-volley zone', 'nvz', 'atp shot', 'around the post'
];

// Pickleball-specific terms and techniques
const PICKLEBALL_TERMS = [
  'serve', 'volley', 'doubles', 'singles', 'return', 'drop shot',
  'drive', 'lob', 'split step', 'ready position', 'footwork',
  'dinking', 'transition zone', 'baseline', 'net play', 'spin serve',
  'tweener', 'reset', 'speedup', 'poach', 'stacking'
];

// Known pickleball coaches and pro players
const PICKLEBALL_COACHES = [
  'ben johns', 'tyson mcguffin', 'simone jardim', 'kyle yates',
  'zane navratil', 'catherine parenteau', 'sarah ansboury', 'jordan briones',
  'riley newman', 'morgan evans', 'steve dawson', 'matt wright'
];

// Pickleball organizations and channels
const PICKLEBALL_CHANNELS = [
  'pickleball', 'pbr', 'ppa', 'app tour', 'usa pickleball',
  'in2pickle', 'better pickleball', 'pickleball studio', 'pickleball kitchen',
  'pickleball 411', 'pickleball channel', 'pickleball central', 'pickleball fire',
  'primetime pickleball', 'third shot sports', 'pickleball fitness'
];

// Non-pickleball sports to filter out (must be explicit)
const EXCLUDED_SPORTS = [
  'tennis court', 'tennis match', 'wimbledon', 'us open tennis',
  'karate', 'martial arts', 'badminton', 'squash',
  'table tennis', 'ping pong', 'racquetball',
  'soccer', 'basketball', 'football', 'baseball', 'hockey'
];

// Validate if content is pickleball-related
function isPickleballContent(title: string, description: string, channel: string, primaryTopic?: string): boolean {
  const combinedText = `${title} ${description} ${channel}`.toLowerCase();
  
  // FIRST: Check for explicit excluded sports
  const hasExcludedSport = EXCLUDED_SPORTS.some(sport => 
    combinedText.includes(sport.toLowerCase())
  );
  
  if (hasExcludedSport) {
    return false;
  }
  
  // SECOND: Check for direct pickleball keywords
  const hasDirectKeyword = PICKLEBALL_KEYWORDS.some(keyword => 
    combinedText.includes(keyword.toLowerCase())
  );
  
  if (hasDirectKeyword) {
    return true;
  }
  
  // THIRD: Check if it's from a known pickleball channel/coach
  const isPickleballChannel = PICKLEBALL_CHANNELS.some(channelName =>
    combinedText.includes(channelName.toLowerCase())
  );
  
  const isPickleballCoach = PICKLEBALL_COACHES.some(coach =>
    combinedText.includes(coach.toLowerCase())
  );
  
  if (isPickleballChannel || isPickleballCoach) {
    return true;
  }
  
  // FOURTH: Check for multiple pickleball terms (at least 2)
  const termMatches = PICKLEBALL_TERMS.filter(term =>
    combinedText.includes(term.toLowerCase())
  ).length;
  
  if (termMatches >= 2) {
    return true;
  }
  
  // FIFTH: If primaryTopic is a pickleball-specific topic, likely valid
  if (primaryTopic && ['Serves', 'Dinking', 'Third Shot Drop', 'Volleys', 'Drives', 
                        'Return of Serve', 'Advanced Techniques', 'Drills'].includes(primaryTopic)) {
    return true;
  }
  
  // If none of the above, treat as non-pickleball
  return false;
}

// GET: Fetch all training videos with strict pickleball filtering
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const skillLevel = searchParams.get('skillLevel');
    const topic = searchParams.get('topic');
    const search = searchParams.get('search');

    const where: any = {};

    if (skillLevel && skillLevel !== 'ALL') {
      where.skillLevel = skillLevel;
    }

    if (topic && topic !== 'ALL') {
      where.primaryTopic = topic;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const videos = await prisma.trainingVideo.findMany({
      where,
      include: {
        userVideoProgress: {
          where: { userId: user.id },
        },
        ratings: {
          where: { userId: user.id },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // CRITICAL: Filter to ensure ONLY pickleball content
    const pickleballVideos = videos.filter(video => 
      isPickleballContent(
        video.title || '',
        video.description || '',
        video.channel || '',
        video.primaryTopic || ''
      )
    );

    // Calculate average ratings for pickleball videos only
    const videosWithStats = await Promise.all(
      pickleballVideos.map(async (video) => {
        const avgRating = await prisma.userVideoRating.aggregate({
          where: { videoId: video.id },
          _avg: { rating: true },
          _count: { rating: true },
        });

        return {
          ...video,
          avgRating: avgRating._avg.rating || 0,
          ratingCount: avgRating._count.rating || 0,
          verified: true, // Mark as verified pickleball content
        };
      })
    );

    return NextResponse.json({ 
      videos: videosWithStats,
      totalCount: videosWithStats.length,
      filtered: videos.length - pickleballVideos.length, // Number of non-pickleball videos filtered out
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}
