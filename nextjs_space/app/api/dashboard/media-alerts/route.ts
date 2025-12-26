
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

    // Generate dynamic media alerts with mix of real-time and upcoming events
    const alerts = [
      {
        id: 'ppa-live-1',
        type: 'live_stream',
        title: 'PPA Tour Championship - Finals Live',
        description: 'Watch the championship match live on YouTube',
        link: 'https://www.youtube.com/c/PPATour/live',
        status: 'live',
        priority: 'high',
        metadata: {
          viewers: 12500,
          date: 'Now'
        }
      },
      {
        id: 'tournament-1',
        type: 'tournament',
        title: 'Golden Ticket Tournament',
        description: 'Register for the upcoming qualifier event in your area',
        link: '/media?tab=events',
        status: 'register',
        priority: 'high',
        metadata: {
          date: 'Dec 15-17',
          location: 'Multiple Cities',
          prize: '$10,000',
          spotsLeft: 12
        }
      },
      {
        id: 'podcast-1',
        type: 'podcast',
        title: 'The Dink Podcast - Episode 342',
        description: 'Pro player interview: Mental game strategies',
        link: '/media?tab=podcasts',
        status: 'upcoming',
        priority: 'medium',
        metadata: {
          date: 'Tomorrow 9am'
        }
      },
      {
        id: 'mlp-event',
        type: 'event',
        title: 'MLP Team Tryouts',
        description: 'Open tryouts for the new MLP season',
        link: '/media?tab=events',
        status: 'register',
        priority: 'high',
        metadata: {
          date: 'Jan 10-12',
          location: 'Dallas, TX',
          spotsLeft: 8
        }
      },
      {
        id: 'news-1',
        type: 'news',
        title: 'New USA Pickleball Rules Update',
        description: '2025 rule changes announced - read the full details',
        link: '/media',
        status: 'upcoming',
        priority: 'medium',
        metadata: {
          date: 'Just Now'
        }
      }
    ]

    // Randomly select 3-4 alerts to show variety
    const randomAlerts = alerts
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 2) + 3) // Show 3-4 random alerts

    return NextResponse.json({
      success: true,
      alerts: randomAlerts
    })

  } catch (error) {
    console.error('Error fetching media alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch media alerts' },
      { status: 500 }
    )
  }
}
