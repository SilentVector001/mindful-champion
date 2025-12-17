
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PickleballApiService } from '@/lib/media-center/pickleball-api-service';
import { SubscriptionUtils } from '@/lib/media-center/subscription-utils';
import { prisma } from '@/lib/db';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    // Get user's tier access
    const tierAccess = await SubscriptionUtils.getUserTierAccess(userId);
    
    const { searchParams } = new URL(request.url);
    const skillLevel = searchParams.get('skillLevel');
    const category = searchParams.get('category');
    const source = searchParams.get('source'); // 'api' | 'youtube' | 'database'

    let trainingVideos = [];

    if (source === 'api') {
      // Get instructional videos from Pickleball API
      trainingVideos = await PickleballApiService.getInstructionalVideos(
        skillLevel || undefined, 
        category || undefined
      );
    } else if (source === 'database') {
      // Get training videos from our database
      const where: any = {};
      if (skillLevel) where.skillLevel = skillLevel.toUpperCase();
      if (category) where.primaryTopic = category;

      trainingVideos = await prisma.trainingVideo.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      });
    } else {
      // Get YouTube training content (curated channels)
      trainingVideos = await getYouTubeTrainingContent(
        skillLevel || undefined, 
        category || undefined
      );
    }

    // For free users, limit the number of videos
    if (!tierAccess.canAccessAdvancedFeatures && trainingVideos.length > 20) {
      trainingVideos = trainingVideos.slice(0, 20);
    }

    return NextResponse.json({
      success: true,
      videos: trainingVideos,
      tierAccess,
      showUpgradePrompt: tierAccess.showUpgradePrompts && trainingVideos.length >= 20,
      categories: getTrainingCategories(),
      skillLevels: ['beginner', 'intermediate', 'advanced', 'pro']
    });

  } catch (error) {
    console.error('Error fetching training library:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch training content',
      videos: [],
      categories: getTrainingCategories()
    }, { status: 500 });

}

async function getYouTubeTrainingContent(skillLevel?: string, category?: string) {
    // YouTube training channels data
    const trainingChannels = [
      {
        name: 'Enhance Pickleball',
        url: 'https://www.youtube.com/@enhancepickleball',
        description: 'Comprehensive pickleball instruction and strategy'
      },
      {
        name: 'Tanner.Pickleball',
        url: 'https://www.youtube.com/@tannerpickleball',
        description: 'Advanced techniques and pro-level instruction'
      },
      {
        name: 'Pickleburner',
        url: 'https://www.youtube.com/@pickleburner',
        description: 'Fun and engaging pickleball tutorials'
      },
      {
        name: 'Kyle Koszuta',
        url: 'https://www.youtube.com/@kylekoszuta',
        description: 'Professional instruction and game analysis'
      }
    ];

    // Return sample training videos based on channels
    return [
      {
        id: 'enhance_1',
        title: 'Mastering the Third Shot Drop - Complete Guide',
        description: 'Learn the most important shot in pickleball with step-by-step instruction',
        url: 'https://youtube.com/watch?v=sample1',
        thumbnailUrl: 'https://i.ytimg.com/vi/wFfEmAu1cZg/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLDUuZ-FJilQ6IKIZxzckzPiiN60NQ',
        duration: 720, // 12 minutes
        instructor: 'Enhance Pickleball',
        skillLevel: 'intermediate',
        category: 'technique',
        tags: ['third shot drop', 'fundamentals', 'strategy'],
        channel: 'Enhance Pickleball'
      },
      {
        id: 'tanner_1',
        title: 'Advanced Dinking Patterns and Strategies',
        description: 'Take your net game to the next level with professional dinking techniques',
        url: 'https://youtube.com/watch?v=sample2',
        thumbnailUrl: 'https://assets.isu.pub/document-structure/230919194341-bf7e946250d101cda9c809a130c53e05/v1/08719f18f81bdf2aab8c08de1adf9474.jpeg',
        duration: 900, // 15 minutes
        instructor: 'Tanner Tomlinson',
        skillLevel: 'advanced',
        category: 'strategy',
        tags: ['dinking', 'net play', 'advanced'],
        channel: 'Tanner.Pickleball'
      }
    ];

}

function getTrainingCategories() {
    return [
      'serving',
      'return-of-serve',
      'third-shot-drop',
      'dinking',
      'volleys',
      'overheads',
      'footwork',
      'positioning',
      'strategy',
      'mental-game',
      'rules',
      'drills'
    ];
}
}
