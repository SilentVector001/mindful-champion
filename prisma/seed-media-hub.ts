import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Media Hub data...');

  // Seed YouTube Videos - Curated Pickleball Content
  console.log('📹 Seeding YouTube videos...');
  
  const youtubeVideos = [
    {
      videoId: 'dQw4w9WgXcQ',
      title: 'Professional Pickleball Serve Technique Tutorial',
      description: 'Learn the perfect serve technique from professional pickleball players',
      thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
      channelName: 'Pickleball Pro Training',
      channelId: 'UCpickleballpro',
      duration: 720,
      publishedAt: new Date('2024-10-01'),
      category: 'Technique',
      tags: JSON.stringify(['serve', 'technique', 'professional', 'tutorial']),
      featured: true,
      orderIndex: 1,
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    },
    {
      videoId: 'xyz123abc456',
      title: 'Third Shot Drop Mastery - Complete Guide',
      description: 'Master the most important shot in pickleball with this comprehensive guide',
      thumbnailUrl: 'https://i.ytimg.com/vi/wFfEmAu1cZg/hqdefault.jpg',
      channelName: 'The Pickleball Studio',
      channelId: 'UCpickleballstudio',
      duration: 895,
      publishedAt: new Date('2024-10-15'),
      category: 'Technique',
      tags: JSON.stringify(['third shot drop', 'strategy', 'advanced', 'tutorial']),
      featured: true,
      orderIndex: 2,
      embedUrl: 'https://www.youtube.com/embed/xyz123abc456',
    },
    {
      videoId: 'abc789def012',
      title: 'PPA Championship Highlights 2024',
      description: 'Watch the best moments from the 2024 PPA Championship Finals',
      thumbnailUrl: 'https://i.ytimg.com/vi/GaFsgYuN634/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCcguSCSNxTr-Mgn_7UsqRREjxXUQ',
      channelName: 'PPA Tour',
      channelId: 'UCppatour',
      duration: 1200,
      publishedAt: new Date('2024-11-01'),
      category: 'Highlights',
      tags: JSON.stringify(['PPA', 'championship', 'highlights', 'professional']),
      featured: true,
      orderIndex: 3,
      embedUrl: 'https://www.youtube.com/embed/abc789def012',
    },
    {
      videoId: 'def345ghi678',
      title: 'Dinking Strategy for Beginners',
      description: 'Learn essential dinking strategies to improve your game',
      thumbnailUrl: 'https://i.ytimg.com/vi/40ap9ZC7EdI/maxresdefault.jpg',
      channelName: 'Better Pickleball',
      channelId: 'UCbetterpickleball',
      duration: 540,
      publishedAt: new Date('2024-10-20'),
      category: 'Strategy',
      tags: JSON.stringify(['dinking', 'strategy', 'beginner', 'tutorial']),
      featured: false,
      orderIndex: 4,
      embedUrl: 'https://www.youtube.com/embed/def345ghi678',
    },
    {
      videoId: 'ghi901jkl234',
      title: 'Court Positioning and Movement',
      description: 'Improve your court positioning and movement with these pro tips',
      thumbnailUrl: 'https://i.ytimg.com/vi/W4wt3vcIy8g/mqdefault.jpg',
      channelName: 'Pickleball Kitchen',
      channelId: 'UCpickleballkitchen',
      duration: 780,
      publishedAt: new Date('2024-09-15'),
      category: 'Strategy',
      tags: JSON.stringify(['positioning', 'movement', 'strategy', 'intermediate']),
      featured: false,
      orderIndex: 5,
      embedUrl: 'https://www.youtube.com/embed/ghi901jkl234',
    },
    {
      videoId: 'jkl567mno890',
      title: 'MLP Team Championship - Match of the Year',
      description: 'The most exciting match from the MLP Team Championship',
      thumbnailUrl: 'https://i.ytimg.com/vi/JpaROn-Y8LI/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLBaPU9ntdU6n5TLniI1w0SO7XGBFA',
      channelName: 'Major League Pickleball',
      channelId: 'UCmlp',
      duration: 2400,
      publishedAt: new Date('2024-11-05'),
      category: 'Match Replay',
      tags: JSON.stringify(['MLP', 'championship', 'team', 'professional']),
      featured: true,
      orderIndex: 6,
      embedUrl: 'https://www.youtube.com/embed/jkl567mno890',
    },
  ];

  for (const video of youtubeVideos) {
    await prisma.youTubeVideo.upsert({
      where: { videoId: video.videoId },
      update: video,
      create: video,
    });
  }

  console.log(`✅ Created ${youtubeVideos.length} YouTube videos`);

  // Seed Pickleball Events
  console.log('🏆 Seeding pickleball events...');
  
  const events = [
    {
      name: 'PPA Lakeland Open',
      shortName: 'Lakeland Open',
      description: 'Professional Pickleball Association tour stop in Lakeland, Florida',
      eventDate: new Date('2024-11-18'),
      endDate: new Date('2024-11-23'),
      organizationName: 'PPA Tour',
      location: 'Lakeland, FL',
      city: 'Lakeland',
      state: 'Florida',
      venue: 'RP Funding Center',
      logoUrl: '/images/tournaments/ppa-lakeland.png',
      broadcastPlatform: 'PickleballTV',
      streamUrl: 'https://stream.pickleballtv.com/tournaments',
      isLive: true,
      hasLiveScores: true,
      websiteUrl: 'https://www.ppatour.com/events/lakeland-open',
      featured: true,
      orderIndex: 1,
    },
    {
      name: 'Daytona Beach Open',
      shortName: 'Daytona Beach',
      description: 'PPA Tour event at the iconic Daytona Beach',
      eventDate: new Date('2024-12-17'),
      endDate: new Date('2024-12-21'),
      organizationName: 'PPA Tour',
      location: 'Daytona Beach, FL',
      city: 'Daytona Beach',
      state: 'Florida',
      venue: 'Daytona Beach Sports Complex',
      logoUrl: '/images/tournaments/ppa-daytona.png',
      broadcastPlatform: 'PickleballTV',
      streamUrl: 'https://stream.pickleballtv.com/tournaments',
      isLive: false,
      hasLiveScores: false,
      websiteUrl: 'https://www.ppatour.com/events/daytona-beach-open',
      featured: true,
      orderIndex: 2,
    },
    {
      name: 'MLP Cup - Dallas',
      shortName: 'MLP Dallas',
      description: 'Major League Pickleball team championship event',
      eventDate: new Date('2024-10-31'),
      endDate: new Date('2024-11-02'),
      organizationName: 'MLP',
      location: 'Dallas, TX',
      city: 'Dallas',
      state: 'Texas',
      venue: 'Fair Park',
      logoUrl: '/images/tournaments/mlp-dallas.png',
      broadcastPlatform: 'ESPN+',
      streamUrl: 'https://www.espn.com/watch/mlp',
      isLive: false,
      hasLiveScores: false,
      websiteUrl: 'https://www.majorleaguepickleball.net',
      featured: true,
      orderIndex: 3,
    },
    {
      name: 'Las Vegas Cup',
      shortName: 'Las Vegas',
      description: 'PPA Tour championship in Las Vegas',
      eventDate: new Date('2024-10-21'),
      endDate: new Date('2024-10-24'),
      organizationName: 'PPA Tour',
      location: 'Las Vegas, NV',
      city: 'Las Vegas',
      state: 'Nevada',
      venue: 'Las Vegas Convention Center',
      logoUrl: '/images/tournaments/ppa-vegas.png',
      broadcastPlatform: 'PickleballTV',
      streamUrl: 'https://stream.pickleballtv.com/tournaments',
      isLive: false,
      hasLiveScores: false,
      websiteUrl: 'https://www.ppatour.com/events/las-vegas-cup',
      featured: false,
      orderIndex: 4,
    },
    {
      name: 'Virginia Beach Cup',
      shortName: 'Virginia Beach',
      description: 'PPA Tour event at Virginia Beach',
      eventDate: new Date('2024-10-07'),
      endDate: new Date('2024-10-12'),
      organizationName: 'PPA Tour',
      location: 'Virginia Beach, VA',
      city: 'Virginia Beach',
      state: 'Virginia',
      venue: 'Virginia Beach Sports Center',
      logoUrl: '/images/tournaments/ppa-virginia.png',
      broadcastPlatform: 'PickleballTV',
      streamUrl: 'https://stream.pickleballtv.com/tournaments',
      isLive: false,
      hasLiveScores: false,
      websiteUrl: 'https://www.ppatour.com/events/virginia-beach-cup',
      featured: false,
      orderIndex: 5,
    },
    {
      name: 'Sacramento Open',
      shortName: 'Sacramento',
      description: 'PPA Tour stop in Sacramento, California',
      eventDate: new Date('2024-09-25'),
      endDate: new Date('2024-09-28'),
      organizationName: 'PPA Tour',
      location: 'Sacramento, CA',
      city: 'Sacramento',
      state: 'California',
      venue: 'Cal Expo',
      logoUrl: '/images/tournaments/ppa-sacramento.png',
      broadcastPlatform: 'PickleballTV',
      streamUrl: 'https://stream.pickleballtv.com/tournaments',
      isLive: false,
      hasLiveScores: false,
      websiteUrl: 'https://www.ppatour.com/events/sacramento-open',
      featured: false,
      orderIndex: 6,
    },
    {
      name: 'Cincinnati Slam',
      shortName: 'Cincinnati',
      description: 'MLP team event in Cincinnati',
      eventDate: new Date('2024-09-09'),
      endDate: new Date('2024-09-14'),
      organizationName: 'MLP',
      location: 'Cincinnati, OH',
      city: 'Cincinnati',
      state: 'Ohio',
      venue: 'Lindner Family Pickleball Center',
      logoUrl: '/images/tournaments/mlp-cincinnati.png',
      broadcastPlatform: 'Pickleball Channel',
      streamUrl: 'https://www.pickleballchannel.com/mlp',
      isLive: false,
      hasLiveScores: false,
      websiteUrl: 'https://www.majorleaguepickleball.net',
      featured: false,
      orderIndex: 7,
    },
    {
      name: 'Hong Kong Open',
      shortName: 'Hong Kong',
      description: 'International pickleball championship in Hong Kong',
      eventDate: new Date('2024-08-21'),
      endDate: new Date('2024-08-24'),
      organizationName: 'APP Tour',
      location: 'Hong Kong',
      city: 'Hong Kong',
      state: '',
      venue: 'Victoria Park',
      logoUrl: '/images/tournaments/app-hongkong.png',
      broadcastPlatform: 'YouTube',
      streamUrl: 'https://www.youtube.com/apptour',
      isLive: false,
      hasLiveScores: false,
      websiteUrl: 'https://www.apptour.org/events/hong-kong-open',
      featured: false,
      orderIndex: 8,
    },
  ];

  for (const event of events) {
    const existing = await prisma.pickleballEvent.findFirst({
      where: { name: event.name },
    });

    if (existing) {
      await prisma.pickleballEvent.update({
        where: { id: existing.id },
        data: event,
      });
    } else {
      await prisma.pickleballEvent.create({
        data: event,
      });
    }
  }

  console.log(`✅ Created ${events.length} pickleball events`);

  // Seed Tournament Matches for Live Event (PPA Lakeland Open)
  console.log('🏓 Seeding tournament matches...');
  
  const lakelandEvent = await prisma.pickleballEvent.findFirst({
    where: { name: 'PPA Lakeland Open' },
  });

  if (lakelandEvent) {
    const matches = [
      {
        eventId: lakelandEvent.id,
        matchNumber: 'M1',
        courtNumber: 'Court 1',
        round: 'Quarterfinals',
        category: "Men's Singles",
        team1Player1: 'Ben Johns',
        team2Player1: 'Tyson McGuffin',
        team1Score: '11-9, 11-7',
        team2Score: '9-11, 7-11',
        status: 'COMPLETED' as any,
        startTime: new Date('2024-11-18T10:00:00'),
        endTime: new Date('2024-11-18T10:45:00'),
        isLive: false,
      },
      {
        eventId: lakelandEvent.id,
        matchNumber: 'M2',
        courtNumber: 'Court 2',
        round: 'Quarterfinals',
        category: "Women's Singles",
        team1Player1: 'Anna Leigh Waters',
        team2Player1: 'Catherine Parenteau',
        team1Score: '11-5',
        team2Score: '7-11',
        status: 'IN_PROGRESS' as any,
        startTime: new Date(),
        isLive: true,
        streamUrl: 'https://stream.pickleballtv.com/court2',
      },
      {
        eventId: lakelandEvent.id,
        matchNumber: 'M3',
        courtNumber: 'Court 3',
        round: 'Quarterfinals',
        category: "Men's Doubles",
        team1Player1: 'Ben Johns',
        team1Player2: 'Collin Johns',
        team2Player1: 'JW Johnson',
        team2Player2: 'Dylan Frazier',
        status: 'IN_PROGRESS' as any,
        startTime: new Date(),
        isLive: true,
        streamUrl: 'https://stream.pickleballtv.com/court3',
      },
      {
        eventId: lakelandEvent.id,
        matchNumber: 'M4',
        courtNumber: 'Court 4',
        round: 'Quarterfinals',
        category: "Women's Doubles",
        team1Player1: 'Anna Leigh Waters',
        team1Player2: 'Leigh Waters',
        team2Player1: 'Catherine Parenteau',
        team2Player2: 'Riley Newman',
        status: 'SCHEDULED' as any,
        scheduledTime: new Date(Date.now() + 3600000), // 1 hour from now
      },
      {
        eventId: lakelandEvent.id,
        matchNumber: 'M5',
        courtNumber: 'Court 1',
        round: 'Semifinals',
        category: "Mixed Doubles",
        team1Player1: 'TBD',
        team1Player2: 'TBD',
        team2Player1: 'TBD',
        team2Player2: 'TBD',
        status: 'SCHEDULED' as any,
        scheduledTime: new Date(Date.now() + 7200000), // 2 hours from now
      },
    ];

    for (const match of matches) {
      await prisma.tournamentMatch.create({
        data: match,
      });
    }

    console.log(`✅ Created ${matches.length} tournament matches`);
  }

  console.log('✨ Media Hub seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding Media Hub data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
