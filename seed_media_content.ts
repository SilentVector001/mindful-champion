import { PrismaClient, NewsCategory } from '@prisma/client';

const prisma = new PrismaClient();

async function seedMediaContent() {
  console.log('🎬 Seeding Media Center content...');

  // 1. Seed Podcast Shows
  console.log('📻 Creating podcast shows...');
  
  const podcastShows = [
    {
      title: 'The Dink Podcast',
      description: 'Deep dives into pro pickleball featuring player interviews, tournament analysis, and strategy discussions',
      author: 'Thomas Shields',
      imageUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400',
      websiteUrl: 'https://www.thedinkpickleball.com',
      category: 'Pro Pickleball',
      totalEpisodes: 6,
    },
    {
      title: 'Pickleball Fire',
      description: 'Mental game mastery, pro player insights, and tournament coverage',
      author: 'Tyler Loong',
      imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400',
      websiteUrl: 'https://pickleballfire.com',
      category: 'Mental Game',
      totalEpisodes: 5,
    },
    {
      title: 'PicklePod',
      description: 'Weekly updates on the pickleball world, gear reviews, and coaching tips',
      author: 'Sarah Ansboury',
      imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400',
      websiteUrl: 'https://picklepod.com',
      category: 'Coaching',
      totalEpisodes: 4,
    },
  ];

  for (const show of podcastShows) {
    const createdShow = await prisma.podcastShow.upsert({
      where: { rssFeedUrl: show.websiteUrl || `${show.title.toLowerCase().replace(/\s/g, '-')}-feed` },
      update: {},
      create: {
        ...show,
        rssFeedUrl: `${show.title.toLowerCase().replace(/\s/g, '-')}-feed`,
      },
    });

    console.log(`✅ Created show: ${createdShow.title}`);

    // Create episodes for each show
    const episodes = [
      {
        title: `Ben Johns' Secret to Consistency - ${show.title}`,
        description: 'Exploring how the #1 player maintains his dominance through mental preparation and drilling routines',
        audioUrl: 'https://example.com/audio1.mp3',
        duration: 2400, // 40 mins
        episodeNumber: 1,
        publishDate: new Date('2025-10-15'),
        imageUrl: show.imageUrl,
      },
      {
        title: `Advanced Dinking Strategies - ${show.title}`,
        description: 'Pro strategies for winning the dink rally and transitioning to offense',
        audioUrl: 'https://example.com/audio2.mp3',
        duration: 1800, // 30 mins
        episodeNumber: 2,
        publishDate: new Date('2025-10-22'),
        imageUrl: show.imageUrl,
      },
      {
        title: `Tournament Mental Game - ${show.title}`,
        description: 'Mental strategies used by pros to stay composed under pressure',
        audioUrl: 'https://example.com/audio3.mp3',
        duration: 2100, // 35 mins
        episodeNumber: 3,
        publishDate: new Date('2025-10-29'),
        imageUrl: show.imageUrl,
      },
      {
        title: `Third Shot Drop Mastery - ${show.title}`,
        description: 'Breaking down the most important shot in pickleball with pro analysis',
        audioUrl: 'https://example.com/audio4.mp3',
        duration: 1500, // 25 mins
        episodeNumber: 4,
        publishDate: new Date('2025-11-01'),
        imageUrl: show.imageUrl,
      },
    ];

    for (const episode of episodes) {
      await prisma.podcastEpisode.create({
        data: {
          ...episode,
          showId: createdShow.id,
        },
      });
    }

    console.log(`  📝 Added ${episodes.length} episodes`);
  }

  // 2. Seed News Items
  console.log('\n📰 Creating news items...');
  
  const newsItems = [
    {
      title: 'Ben Johns Wins PPA Tour Championship',
      description: 'The world #1 secures another major title with dominant performance in singles and doubles',
      content: 'Full coverage of the championship match...',
      sourceUrl: 'https://example.com/news1',
      imageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800',
      source: 'PPA Tour',
      category: NewsCategory.TOURNAMENT,
      publishDate: new Date('2025-11-01'),
    },
    {
      title: 'Anna Leigh Waters: The Young Phenom',
      description: 'At 18, how Anna Leigh is changing the game with her aggressive style',
      content: 'Player profile...',
      sourceUrl: 'https://example.com/news2',
      imageUrl: 'https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?w=800',
      source: 'The Dink',
      category: NewsCategory.PLAYER_SPOTLIGHT,
      publishDate: new Date('2025-10-30'),
    },
    {
      title: 'Top 5 Paddle Technology Innovations of 2025',
      description: 'How new materials and designs are revolutionizing the sport',
      content: 'Gear review...',
      sourceUrl: 'https://example.com/news3',
      imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800',
      source: 'Pickleball Magazine',
      category: NewsCategory.GENERAL,
      publishDate: new Date('2025-10-28'),
    },
    {
      title: 'MLP Season Playoffs: Teams Battle for Championship',
      description: 'Major League Pickleball playoffs heating up with stunning upsets',
      content: 'Tournament coverage...',
      sourceUrl: 'https://example.com/news4',
      imageUrl: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800',
      source: 'MLP',
      category: NewsCategory.TOURNAMENT,
      publishDate: new Date('2025-10-27'),
    },
    {
      title: 'Mastering the Erne: Pro Tips and Drills',
      description: 'Everything you need to know about executing this highlight-reel shot',
      content: 'Technique guide...',
      sourceUrl: 'https://example.com/news5',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      source: 'Pro Pickleball Association',
      category: NewsCategory.TECHNIQUE,
      publishDate: new Date('2025-10-26'),
    },
    {
      title: 'Catherine Parenteau Returns After Injury',
      description: 'Fan favorite makes triumphant return to competition at the APP Tour',
      content: 'Player update...',
      sourceUrl: 'https://example.com/news6',
      imageUrl: 'https://pbs.twimg.com/profile_images/1924859417532444672/jw2fzGEW.jpg',
      source: 'APP Tour',
      category: NewsCategory.PLAYER_SPOTLIGHT,
      publishDate: new Date('2025-10-25'),
    },
    {
      title: 'PPA Dallas Open: Preview and Predictions',
      description: 'What to watch for in this weekend\'s biggest tournament',
      content: 'Tournament preview...',
      sourceUrl: 'https://example.com/news7',
      imageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800',
      source: 'PPA Tour',
      category: NewsCategory.TOURNAMENT,
      publishDate: new Date('2025-11-02'),
    },
    {
      title: 'Indoor vs Outdoor: Strategy Adjustments',
      description: 'How pros adapt their game for different playing conditions',
      content: 'Strategy analysis...',
      sourceUrl: 'https://example.com/news8',
      imageUrl: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800',
      source: 'Pickleball Strategy',
      category: NewsCategory.TECHNIQUE,
      publishDate: new Date('2025-10-24'),
    },
  ];

  for (const news of newsItems) {
    await prisma.newsItem.upsert({
      where: { sourceUrl: news.sourceUrl },
      update: {},
      create: news,
    });
    console.log(`✅ Created news: ${news.title}`);
  }

  console.log('\n✨ Media Center content seeding complete!');
}

seedMediaContent()
  .catch((e) => {
    console.error('Error seeding media content:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
