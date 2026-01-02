//@ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

const ALL_BADGES = [
  // Streak badges
  { id: 'streak-3', name: '3 Day Streak', icon: '🔥', color: 'yellow', category: 'streak', requirement: 'Train 3 days in a row' },
  { id: 'streak-7', name: '7 Day Streak', icon: '🔥', color: 'orange', category: 'streak', requirement: 'Train 7 days in a row' },
  { id: 'streak-14', name: '2 Week Streak', icon: '🔥', color: 'orange', category: 'streak', requirement: 'Train 14 days in a row' },
  { id: 'streak-30', name: 'Monthly Master', icon: '🔥', color: 'gold', category: 'streak', requirement: 'Train 30 days in a row' },
  
  // Level badges
  { id: 'level-5', name: 'Level 5', icon: '🏆', color: 'cyan', category: 'milestone', requirement: 'Reach Level 5' },
  { id: 'level-10', name: 'Level 10', icon: '🏆', color: 'purple', category: 'milestone', requirement: 'Reach Level 10' },
  { id: 'level-20', name: 'Level 20', icon: '🏆', color: 'gold', category: 'milestone', requirement: 'Reach Level 20' },
  
  // Training badges
  { id: 'first-drill', name: 'First Steps', icon: '🎯', color: 'emerald', category: 'training', requirement: 'Complete your first drill' },
  { id: 'drills-10', name: 'Drill Novice', icon: '🎯', color: 'emerald', category: 'training', requirement: 'Complete 10 drills' },
  { id: 'drills-50', name: 'Drill Expert', icon: '🎯', color: 'blue', category: 'training', requirement: 'Complete 50 drills' },
  { id: 'drills-100', name: 'Drill Master', icon: '🎯', color: 'purple', category: 'training', requirement: 'Complete 100 drills' },
  
  // Program badges
  { id: 'first-program', name: 'Program Started', icon: '📚', color: 'teal', category: 'achievement', requirement: 'Start your first program' },
  { id: 'program-complete', name: 'Program Graduate', icon: '🎓', color: 'gold', category: 'achievement', requirement: 'Complete a program' },
  { id: 'programs-3', name: 'Triple Threat', icon: '🏅', color: 'gold', category: 'achievement', requirement: 'Complete 3 programs' },
]

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const earnedBadges = await prisma.userBadge.findMany({
      where: { userId: session.user.id },
      orderBy: { earnedAt: 'desc' }
    })

    const earnedIds = new Set(earnedBadges.map(b => b?.badgeId))

    const allBadgesWithStatus = ALL_BADGES.map(badge => ({
      ...badge,
      earned: earnedIds.has(badge.id),
      earnedAt: earnedBadges.find(b => b?.badgeId === badge.id)?.earnedAt
    }))

    return NextResponse.json({
      earned: earnedBadges,
      all: allBadgesWithStatus,
      totalEarned: earnedBadges?.length ?? 0,
      totalAvailable: ALL_BADGES.length
    })
  } catch (error) {
    console.error('Error fetching badges:', error)
    return NextResponse.json({ error: 'Failed to fetch badges' }, { status: 500 })
  }
}
