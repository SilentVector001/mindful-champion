
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Dynamic pickleball news and tournament headlines
    const newsItems = [
      {
        id: 'ppa-tour-1',
        type: 'tournament',
        title: 'PPA Tour Championship Finals',
        subtitle: 'Championship match streaming live now',
        priority: 'urgent',
        link: '/media',
        icon: '🏆',
        status: 'LIVE',
        viewers: 15000
      },
      {
        id: 'mlp-news-1',
        type: 'stream',
        title: 'MLP Season 4 Announcement',
        subtitle: 'New teams and player rosters revealed',
        priority: 'high',
        link: '/media?tab=events',
        icon: '📺',
        daysUntil: 2
      },
      {
        id: 'usa-pb-1',
        type: 'tournament',
        title: 'USA Pickleball National Championships',
        subtitle: 'Registration opens for all skill divisions',
        priority: 'high',
        link: '/media?tab=events',
        icon: '🎯',
        daysUntil: 15
      },
      {
        id: 'golden-ticket-1',
        type: 'tournament',
        title: 'Golden Ticket Qualifier Events',
        subtitle: '12 spots remaining for regional qualifiers',
        priority: 'high',
        link: '/media?tab=events',
        icon: '🎫',
        daysUntil: 7
      },
      {
        id: 'podcast-1',
        type: 'podcast',
        title: 'The Dink Podcast - New Episode',
        subtitle: 'Pro interview with Ben Johns on strategy',
        priority: 'medium',
        link: '/media?tab=podcasts',
        icon: '🎙️',
        timeAgo: 2
      },
      {
        id: 'score-1',
        type: 'score',
        title: 'Live Tournament Scores',
        subtitle: '8 matches in progress across 3 tournaments',
        priority: 'medium',
        link: '/media',
        icon: '📊',
        activeMatches: 8
      },
      {
        id: 'community-1',
        type: 'community',
        title: 'Community Milestone',
        subtitle: '10,000 players joined this month!',
        priority: 'low',
        link: '/connect',
        icon: '🎉'
      },
      {
        id: 'training-1',
        type: 'training',
        title: 'New Pro Technique Videos',
        subtitle: '5 new advanced shot tutorials added',
        priority: 'medium',
        link: '/train/library',
        icon: '📹',
        timeAgo: 1
      },
      {
        id: 'tournament-2',
        type: 'tournament',
        title: 'APP Tour - Major Event',
        subtitle: 'Prize pool: $200,000 - Watch live streams',
        priority: 'high',
        link: '/media',
        icon: '💰',
        status: 'LIVE',
        viewers: 8500
      }
    ]

    // Sort by priority and return
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
    const sortedNews = newsItems.sort((a, b) => 
      priorityOrder[a.priority as keyof typeof priorityOrder] - 
      priorityOrder[b.priority as keyof typeof priorityOrder]
    )

    return NextResponse.json({
      success: true,
      ticker: {
        items: sortedNews
      }
    })

  } catch (error) {
    console.error('Error fetching news ticker:', error)
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    )
  }
}
