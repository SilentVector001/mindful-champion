// @ts-nocheck

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

    // Get recent activities from multiple sources
    const activities: any[] = []

    // Recent signups
    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        subscriptionTier: true
      }
    })

    recentUsers.forEach(user => {
      activities.push({
        id: `signup-${user.id}`,
        type: 'signup',
        userName: user.firstName || user.name || user.email?.split('@')[0] || 'User',
        description: `Signed up${user.subscriptionTier ? ` (${user.subscriptionTier})` : ''}`,
        timestamp: user.createdAt,
        userId: user.id
      })
    })

    // Recent video uploads
    try {
      const recentVideos = await prisma.videoAnalysis.findMany({
        orderBy: { createdAt: 'desc' },
        take: 15,
        include: {
          user: { select: { email: true, firstName: true, name: true } }
        }
      })

      recentVideos.forEach(video => {
        activities.push({
          id: `video-${video.id}`,
          type: 'video_upload',
          userName: video.user?.firstName || video.user?.name || video.user?.email?.split('@')[0] || 'User',
          description: `Uploaded video: ${video.fileName || 'Video'}`,
          timestamp: video.createdAt,
          userId: video.userId
        })
      })
    } catch (e) {
      console.log('No video analysis table')
    }

    // Recent coach chats
    try {
      const recentChats = await prisma.kaiConversation.findMany({
        orderBy: { createdAt: 'desc' },
        take: 15,
        include: {
          user: { select: { email: true, firstName: true, name: true } }
        }
      })

      recentChats.forEach(chat => {
        activities.push({
          id: `chat-${chat.id}`,
          type: 'coach_chat',
          userName: chat.user?.firstName || chat.user?.name || chat.user?.email?.split('@')[0] || 'User',
          description: 'Started Coach Kai session',
          timestamp: chat.createdAt,
          userId: chat.userId
        })
      })
    } catch (e) {
      console.log('No kai conversation table')
    }

    // Recent achievements
    try {
      const recentAchievements = await prisma.userAchievement.findMany({
        orderBy: { earnedAt: 'desc' },
        take: 10,
        include: {
          user: { select: { email: true, firstName: true, name: true } },
          achievement: { select: { name: true } }
        }
      })

      recentAchievements.forEach(ach => {
        activities.push({
          id: `ach-${ach.id}`,
          type: 'achievement',
          userName: ach.user?.firstName || ach.user?.name || ach.user?.email?.split('@')[0] || 'User',
          description: `Earned: ${ach.achievement?.name || 'Achievement'}`,
          timestamp: ach.earnedAt,
          userId: ach.userId
        })
      })
    } catch (e) {
      console.log('No achievement table')
    }

    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({ activities: activities.slice(0, 50) })
  } catch (error) {
    console.error('Activity feed error:', error)
    return NextResponse.json({ error: 'Failed to fetch activities', activities: [] }, { status: 500 })
  }
}
