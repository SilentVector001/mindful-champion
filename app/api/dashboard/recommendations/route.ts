
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get user data for personalized recommendations - with error handling
    const results = await Promise.allSettled([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          skillLevel: true,
          primaryGoals: true,
          biggestChallenges: true,
          currentStreak: true,
          lastActiveDate: true,
          playingFrequency: true
        }
      }),

      prisma.userProgram.findMany({
        where: { userId },
        include: { program: true }
      }).catch(() => []),

      prisma.trainingPlan.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5
      }).catch(() => []),

      prisma.userAchievement.count({ where: { userId } }).catch(() => 0),

      prisma.userVideoProgress.findMany({
        where: { userId },
        include: { video: true },
        orderBy: { updatedAt: 'desc' },
        take: 5
      }).catch(() => [])
    ])

    // Extract values from settled promises
    const user = results[0].status === 'fulfilled' ? results[0].value : null
    const userPrograms = results[1].status === 'fulfilled' ? results[1].value : []
    const recentActivity = results[2].status === 'fulfilled' ? results[2].value : []
    const achievements = results[3].status === 'fulfilled' ? results[3].value : 0
    const videoProgress = results[4].status === 'fulfilled' ? results[4].value : []

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const recommendations = []
    
    // Active program continuation
    const activeProgram = userPrograms.find(up => up.status === 'IN_PROGRESS')
    if (activeProgram) {
      recommendations.push({
        id: 'continue-program',
        type: 'training',
        priority: 'high',
        title: 'Continue Your Training Journey',
        description: `Day ${activeProgram.currentDay} of ${activeProgram.program.name}`,
        action: {
          type: 'navigate',
          path: `/train/program/${activeProgram.programId}`,
          buttonText: 'Continue Training'
        },
        metadata: {
          progress: activeProgram.completionPercentage,
          daysLeft: activeProgram.program.durationDays - activeProgram.currentDay,
          programName: activeProgram.program.name
        }
      })
    }

    // Skill-based recommendations
    if (user.skillLevel === 'BEGINNER') {
      recommendations.push({
        id: 'beginner-fundamentals',
        type: 'video',
        priority: 'high',
        title: 'Master the Fundamentals',
        description: 'Essential techniques for new players',
        action: {
          type: 'navigate',
          path: '/train/library?skill=beginner',
          buttonText: 'Watch Videos'
        }
      })
    } else if (user.skillLevel === 'INTERMEDIATE') {
      recommendations.push({
        id: 'intermediate-strategy',
        type: 'training',
        priority: 'medium',
        title: 'Advanced Strategy Training',
        description: 'Take your game to the next level',
        action: {
          type: 'navigate',
          path: '/train/programs?level=intermediate',
          buttonText: 'Explore Programs'
        }
      })
    }

    // Goal-based recommendations
    const goals = Array.isArray(user.primaryGoals) ? user.primaryGoals : []
    if (goals.includes('find-partners')) {
      recommendations.push({
        id: 'find-partners',
        type: 'social',
        priority: 'medium',
        title: 'Find Playing Partners',
        description: 'Connect with players in your area',
        action: {
          type: 'navigate',
          path: '/connect/partners',
          buttonText: 'Find Partners'
        }
      })
    }

    if (goals.includes('improve-technique')) {
      recommendations.push({
        id: 'video-analysis',
        type: 'analysis',
        priority: 'high',
        title: 'Analyze Your Technique',
        description: 'Upload a video for AI-powered feedback',
        action: {
          type: 'navigate',
          path: '/train/video',
          buttonText: 'Upload Video'
        }
      })
    }

    // Streak-based motivation
    if (user.currentStreak === 0) {
      recommendations.push({
        id: 'start-streak',
        type: 'motivation',
        priority: 'medium',
        title: 'Start Your Training Streak',
        description: 'Build consistent training habits',
        action: {
          type: 'navigate',
          path: '/train',
          buttonText: 'Start Training'
        }
      })
    } else if (user.currentStreak >= 7) {
      recommendations.push({
        id: 'maintain-streak',
        type: 'motivation',
        priority: 'high',
        title: 'Maintain Your Amazing Streak!',
        description: `Keep your ${user.currentStreak}-day streak alive`,
        action: {
          type: 'navigate',
          path: '/train',
          buttonText: 'Continue Streak'
        }
      })
    }

    // Daily tip from Coach Kai
    const dailyTips = [
      {
        tip: "Focus on your paddle position during ready stance - it should be in front of your body, not to the side.",
        category: "Technique",
        difficulty: user.skillLevel
      },
      {
        tip: "Practice your third shot drop by hitting 10 balls in a row to the kitchen line.",
        category: "Skills",
        difficulty: user.skillLevel
      },
      {
        tip: "Watch your opponent's paddle face to anticipate where they'll hit the ball.",
        category: "Strategy",
        difficulty: user.skillLevel
      },
      {
        tip: "Take a deep breath and reset mentally after every point - mental game is half the battle.",
        category: "Mental",
        difficulty: user.skillLevel
      },
      {
        tip: "Move your feet to get in position early - don't reach for shots when you can step into them.",
        category: "Movement",
        difficulty: user.skillLevel
      }
    ]

    const todaysTip = dailyTips[new Date().getDate() % dailyTips.length]

    return NextResponse.json({
      success: true,
      recommendations: recommendations.slice(0, 4), // Limit to top 4
      dailyTip: todaysTip,
      motivationalQuote: {
        text: "Every champion was once a beginner who refused to give up.",
        author: "Coach Kai",
        category: "Persistence"
      },
      userPersona: {
        skillLevel: user.skillLevel,
        goals: goals,
        challenges: user.biggestChallenges || [],
        streak: user.currentStreak,
        lastActive: user.lastActiveDate
      }
    })

  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    )
  }
}
