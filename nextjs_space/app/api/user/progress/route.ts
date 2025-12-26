// User Progress API - Provides comprehensive user data to Coach Kai
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        firstName: true,
        name: true,
        skillLevel: true,
        playerRating: true,
        totalMatches: true,
        totalWins: true,
        currentStreak: true,
        focusScore: true,
        confidenceScore: true,
        stressScore: true,
        primaryGoals: true,
        biggestChallenges: true,
        playingFrequency: true,
        rewardPoints: true
      }
    })

    // Get active goals with milestones
    const goals = await prisma.goal.findMany({
      where: { userId: session.user.id },
      include: {
        milestones: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Get recent matches
    const matches = await prisma.match.findMany({
      where: { userId: session.user.id },
      orderBy: { date: 'desc' },
      take: 10
    })

    // Get recent video analyses
    const videoAnalyses = await prisma.videoAnalysis.findMany({
      where: {
        userId: session.user.id,
        analysisStatus: 'COMPLETED'
      },
      orderBy: { analyzedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        overallScore: true,
        strengths: true,
        areasForImprovement: true,
        analyzedAt: true
      }
    })

    // Get skill progress
    const skillProgress = await prisma.skillProgress.findMany({
      where: { userId: session.user.id },
      orderBy: { proficiency: 'desc' }
    })

    // Get recent achievements
    const achievements = await prisma.userAchievement.findMany({
      where: { userId: session.user.id },
      include: {
        achievement: true
      },
      orderBy: { unlockedAt: 'desc' },
      take: 5
    })

    // Get training program progress
    const programProgress = await prisma.userProgram.findMany({
      where: { userId: session.user.id },
      include: {
        program: true
      },
      orderBy: { updatedAt: 'desc' },
      take: 3
    })

    // Calculate stats
    const winRate = user?.totalMatches && user.totalMatches > 0
      ? ((user.totalWins || 0) / user.totalMatches * 100).toFixed(1)
      : '0'

    const activeGoalsCount = goals.filter(g => g.status === 'ACTIVE').length
    const completedGoalsCount = goals.filter(g => g.status === 'COMPLETED').length

    const averageAnalysisScore = videoAnalyses.length > 0
      ? (videoAnalyses.reduce((sum, v) => sum + (v.overallScore || 0), 0) / videoAnalyses.length).toFixed(1)
      : '0'

    return NextResponse.json({
      profile: {
        firstName: user?.firstName || user?.name?.split(' ')[0] || 'Champion',
        skillLevel: user?.skillLevel,
        playerRating: user?.playerRating,
        rewardPoints: user?.rewardPoints,
        mentalScores: {
          focus: user?.focusScore,
          confidence: user?.confidenceScore,
          stress: user?.stressScore
        }
      },
      stats: {
        totalMatches: user?.totalMatches || 0,
        totalWins: user?.totalWins || 0,
        winRate: parseFloat(winRate),
        currentStreak: user?.currentStreak || 0,
        activeGoals: activeGoalsCount,
        completedGoals: completedGoalsCount,
        averageAnalysisScore: parseFloat(averageAnalysisScore)
      },
      goals: goals.map(g => ({
        id: g.id,
        title: g.title,
        category: g.category,
        status: g.status,
        progress: g.progress,
        targetDate: g.targetDate,
        milestones: g.milestones.map(m => ({
          title: m.title,
          status: m.status,
          currentValue: m.currentValue,
          targetValue: m.targetValue
        }))
      })),
      recentMatches: matches.map(m => ({
        id: m.id,
        date: m.date,
        opponent: m.opponent,
        result: m.result,
        score: `${m.playerScore}-${m.opponentScore}`
      })),
      videoAnalyses: videoAnalyses.map(v => ({
        id: v.id,
        title: v.title,
        score: v.overallScore,
        strengths: v.strengths,
        improvements: v.areasForImprovement,
        date: v.analyzedAt
      })),
      skillProgress: skillProgress.map(s => ({
        skill: s.skillName,
        proficiency: s.proficiency,
        sessions: s.totalSessions,
        improvement: s.improvementRate
      })),
      achievements: achievements.map(a => ({
        name: a.achievement.name,
        description: a.achievement.description,
        unlockedAt: a.unlockedAt
      })),
      programs: programProgress.map(p => ({
        name: p.program.name,
        status: p.status,
        completion: p.completionPercentage,
        currentDay: p.currentDay
      }))
    })
  } catch (error: any) {
    console.error('User progress API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
