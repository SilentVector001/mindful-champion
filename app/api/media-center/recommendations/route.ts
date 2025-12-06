
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ContentType } from '@prisma/client';
import { SubscriptionUtils } from '@/lib/media-center/subscription-utils';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get('contentType') as ContentType;
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get user's tier access
    const tierAccess = await SubscriptionUtils.getUserTierAccess(userId);

    // Get user profile for better recommendations
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        skillLevel: true,
        primaryGoals: true,
        biggestChallenges: true,
        playingFrequency: true
      }
    });

    // Get user's watch history for personalization
    const watchHistory = await prisma.userWatchHistory.findMany({
      where: { userId },
      orderBy: { watchedAt: 'desc' },
      take: 20
    });

    // Get user's wearable data for recovery-based recommendations
    const healthData = await prisma.healthData.findMany({
      where: {
        userId
      },
      orderBy: { recordedAt: 'desc' },
      take: 7 // Last week
    });

    // Generate recommendations based on user profile and activity
    const recommendations = await generateRecommendations({
      userId,
      user,
      watchHistory,
      healthData,
      contentType,
      limit,
      tierAccess
    });

    return NextResponse.json({
      success: true,
      recommendations,
      tierAccess
    });

  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to generate recommendations',
      recommendations: []
    }, { status: 500 });
  }
}

async function generateRecommendations({
    userId,
    user,
    watchHistory,
    healthData,
    contentType,
    limit,
    tierAccess
  }: any) {
    const recommendations = [];

    // Skill-based recommendations
    if (user?.skillLevel) {
      const skillBasedContent = await getSkillBasedRecommendations(user.skillLevel);
      recommendations.push(...skillBasedContent);
    }

    // Goal-based recommendations
    if (user?.primaryGoals) {
      const goalBasedContent = await getGoalBasedRecommendations(user.primaryGoals);
      recommendations.push(...goalBasedContent);
    }

    // Challenge-based recommendations
    if (user?.biggestChallenges) {
      const challengeBasedContent = await getChallengeBasedRecommendations(user.biggestChallenges);
      recommendations.push(...challengeBasedContent);
    }

    // Recovery-based recommendations from wearable data
    if (healthData?.length > 0) {
      const recoveryContent = await getRecoveryBasedRecommendations(healthData);
      recommendations.push(...recoveryContent);
    }

    // Trending content
    const trendingContent = await getTrendingContent();
    recommendations.push(...trendingContent);

    // Remove duplicates and limit results
    const uniqueRecommendations = recommendations
      .filter((rec, index, self) => 
        index === self.findIndex(r => r.contentId === rec.contentId)
      )
      .slice(0, limit);

    // Store recommendations in database for tracking
    for (const rec of uniqueRecommendations) {
      await prisma.userContentRecommendation.upsert({
        where: {
          userId_contentType_contentId: {
            userId,
            contentType: rec.contentType,
            contentId: rec.contentId
          }
        },
        update: {
          score: rec.score,
          reason: rec.reason
        },
        create: {
          userId,
          contentType: rec.contentType,
          contentId: rec.contentId,
          title: rec.title,
          description: rec.description,
          thumbnailUrl: rec.thumbnailUrl,
          url: rec.url,
          score: rec.score,
          reason: rec.reason,
          metadata: rec.metadata
        }
      });
    }

    return uniqueRecommendations;
}

async function getSkillBasedRecommendations(skillLevel: string) {
    // Sample skill-based recommendations
    return [
      {
        contentType: 'TRAINING_DRILL' as ContentType,
        contentId: `skill_${skillLevel}_1`,
        title: `${skillLevel.charAt(0).toUpperCase() + skillLevel.slice(1)} Third Shot Drop Practice`,
        description: `Master the third shot drop with drills designed for ${skillLevel} players`,
        thumbnailUrl: 'https://i.ytimg.com/vi/EI-YzOEwY-o/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLD5M3pKVw8SKC3zwcD4nMx5Cslt0w',
        url: 'https://youtube.com/watch?v=sample',
        score: 0.9,
        reason: `Recommended for your ${skillLevel} skill level`,
        metadata: { skillLevel, category: 'technique' }
      }
    ];
}

async function getGoalBasedRecommendations(primaryGoals: any) {
    // Parse goals and return relevant content
    return [
      {
        contentType: 'VIDEO' as ContentType,
        contentId: 'goal_based_1',
        title: 'Tournament Preparation Strategy',
        description: 'Prepare mentally and physically for competitive play',
        thumbnailUrl: 'https://i.ytimg.com/vi/PyUGvd4mFa0/hqdefault.jpg',
        url: 'https://youtube.com/watch?v=sample2',
        score: 0.85,
        reason: 'Based on your tournament goals',
        metadata: { goals: primaryGoals }
      }
    ];
}

async function getChallengeBasedRecommendations(biggestChallenges: any) {
    // Address specific challenges
    return [
      {
        contentType: 'TECHNIQUE_GUIDE' as ContentType,
        contentId: 'challenge_1',
        title: 'Overcoming Dinking Errors',
        description: 'Fix common mistakes at the net',
        thumbnailUrl: 'https://i.ytimg.com/vi/3YPZB7eyzTM/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCKae1CdXq3ETinHFMQWZUu7MN6QA',
        url: 'https://youtube.com/watch?v=sample3',
        score: 0.8,
        reason: 'Addresses your reported challenges',
        metadata: { challenges: biggestChallenges }
      }
    ];
}

async function getRecoveryBasedRecommendations(healthData: any[]) {
    // Analyze sleep, HRV, stress levels to recommend recovery content
    const avgSleep = healthData
      .filter(d => d.dataType === 'SLEEP_DURATION')
      .reduce((sum, d) => sum + (d.value || 0), 0) / 7;

    if (avgSleep < 7) {
      return [
        {
          contentType: 'VIDEO' as ContentType,
          contentId: 'recovery_sleep',
          title: 'Mental Recovery Techniques for Athletes',
          description: 'Improve your recovery with mindfulness and sleep optimization',
          thumbnailUrl: 'https://www.shutterstock.com/image-vector/september-national-recovery-month-vector-260nw-2667530629.jpg',
          url: 'https://youtube.com/watch?v=recovery',
          score: 0.75,
          reason: 'Your sleep data suggests you might benefit from recovery content',
          metadata: { avgSleep, recommendation: 'recovery' }
        }
      ];
    }

    return [];
}

async function getTrendingContent() {
    // Get popular content based on view counts, bookmarks, etc.
    return [
      {
        contentType: 'PODCAST_EPISODE' as ContentType,
        contentId: 'trending_1',
        title: 'Latest PPA Tour Analysis with Ben Johns',
        description: 'Breaking down the latest professional matches',
        thumbnailUrl: 'https://i.ytimg.com/vi/kUK1mrmZYL4/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLC-L6iiWb-L_nS_MvisWs7GW8wEdQ',
        url: 'https://sample-podcast.com/episode',
        score: 0.7,
        reason: 'Trending in the pickleball community',
        metadata: { trending: true }
      }
    ];
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }

    const userId = session.user.id;
    const { recommendationId, action } = await request.json(); // 'view' | 'dismiss'

    const updateData: any = {};
    if (action === 'view') {
      updateData.isViewed = true;
      updateData.viewedAt = new Date();
    } else if (action === 'dismiss') {
      updateData.isDismissed = true;
      updateData.dismissedAt = new Date();
    }

    await prisma.userContentRecommendation.update({
      where: { id: recommendationId },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      message: `Recommendation ${action}ed`
    });

  } catch (error) {
    console.error('Error updating recommendation:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update recommendation'
    }, { status: 500 });
  }
}
