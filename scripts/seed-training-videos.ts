import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
config({ path: path.resolve(process.cwd(), '.env.local') })

const prisma = new PrismaClient()

const sampleVideos = [
  {
    videoId: 'demo-1',
    title: 'Mastering the Third Shot Drop - Essential Pickleball Technique',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    channel: 'Pickleball Mastery',
    duration: '12:34',
    description: 'Learn the fundamentals of the third shot drop, one of the most important shots in pickleball. Perfect for intermediate players looking to improve their soft game.',
    skillLevel: 'INTERMEDIATE',
    primaryTopic: 'Third Shot Drop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&h=450&fit=crop',
  },
  {
    videoId: 'demo-2',
    title: 'Dinking Strategy: How to Win More Points at the Kitchen',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    channel: 'Pro Pickleball Tips',
    duration: '15:22',
    description: 'Master the art of dinking with professional strategies. Learn patience, positioning, and how to create opportunities at the non-volley zone.',
    skillLevel: 'ADVANCED',
    primaryTopic: 'Dinking',
    thumbnailUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&h=450&fit=crop',
  },
  {
    videoId: 'demo-3',
    title: 'Pickleball Serve Fundamentals for Beginners',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    channel: 'Pickleball Basics',
    duration: '10:15',
    description: 'Start your pickleball journey right with proper serve technique. This video covers the basics of the underhand serve, grip, stance, and follow-through.',
    skillLevel: 'BEGINNER',
    primaryTopic: 'Serves',
    thumbnailUrl: 'https://i.ytimg.com/vi/X2FQHZ3abqk/mqdefault.jpg',
  },
  {
    videoId: 'demo-4',
    title: 'Advanced Volley Techniques with Ben Johns',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    channel: 'Pickleball Pro',
    duration: '18:45',
    description: 'Learn advanced volleying techniques from pro player Ben Johns. Covers punch volleys, swing volleys, and net positioning for aggressive play.',
    skillLevel: 'ADVANCED',
    primaryTopic: 'Volleys',
    thumbnailUrl: 'https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?w=800&h=450&fit=crop',
  },
  {
    videoId: 'demo-5',
    title: 'Footwork Drills to Improve Your Pickleball Game',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    channel: 'Pickleball Fitness',
    duration: '14:20',
    description: 'Essential footwork drills that will transform your court coverage. Learn proper split step timing, lateral movement, and transition zone footwork.',
    skillLevel: 'INTERMEDIATE',
    primaryTopic: 'Footwork',
    thumbnailUrl: 'https://images.unsplash.com/photo-1594911772125-07fc7a2d8d9f?w=800&h=450&fit=crop',
  },
  {
    videoId: 'demo-6',
    title: 'Return of Serve: Strategy and Execution',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    channel: 'Pickleball Strategy',
    duration: '11:30',
    description: 'Master the return of serve with proven strategies. Learn deep returns, angled returns, and how to set up your third shot.',
    skillLevel: 'INTERMEDIATE',
    primaryTopic: 'Return of Serve',
    thumbnailUrl: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&h=450&fit=crop',
  },
  {
    videoId: 'demo-7',
    title: 'Pickleball Doubles Strategy: Communication and Positioning',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    channel: 'Pickleball Partners',
    duration: '16:50',
    description: 'Elevate your doubles game with advanced strategies. Learn stack formations, switch timing, and how to communicate effectively with your partner.',
    skillLevel: 'ADVANCED',
    primaryTopic: 'Strategy',
    thumbnailUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&h=450&fit=crop',
  },
  {
    videoId: 'demo-8',
    title: 'Power Drive Techniques for Attacking Pickleball',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    channel: 'Aggressive Pickleball',
    duration: '13:15',
    description: 'Learn when and how to hit powerful drives. Perfect for players who want to add an attacking element to their game.',
    skillLevel: 'ADVANCED',
    primaryTopic: 'Drives',
    thumbnailUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&h=450&fit=crop',
  },
  {
    videoId: 'demo-9',
    title: 'Essential Pickleball Drills for Solo Practice',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    channel: 'Solo Pickleball Training',
    duration: '20:10',
    description: 'Comprehensive drill collection you can do by yourself. Includes wall drills, serve practice, and footwork exercises.',
    skillLevel: 'BEGINNER',
    primaryTopic: 'Drills',
    thumbnailUrl: 'https://i.ytimg.com/vi/dn-zRAlR2cI/mqdefault.jpg',
  },
  {
    videoId: 'demo-10',
    title: 'Mental Game: Staying Focused During Tournaments',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    channel: 'Mindful Pickleball',
    duration: '19:25',
    description: 'Develop mental toughness for competitive play. Learn visualization techniques, emotional control, and how to recover from mistakes.',
    skillLevel: 'INTERMEDIATE',
    primaryTopic: 'Mental Game',
    thumbnailUrl: 'https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?w=800&h=450&fit=crop',
  },
]

async function main() {
  console.log('🎥 Seeding training videos...')

  for (const video of sampleVideos) {
    const created = await prisma.trainingVideo.upsert({
      where: { videoId: video.videoId },
      update: video,
      create: video,
    })
    console.log(`✅ Created/Updated: ${created.title}`)
  }

  console.log(`\n🎉 Successfully seeded ${sampleVideos.length} training videos!`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding videos:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
