
import { ApiCache } from './api-cache';
import { prisma } from '@/lib/db';

export interface PodcastShowInfo {
  title: string;
  description: string;
  author: string;
  imageUrl: string;
  rssFeedUrl: string;
  websiteUrl?: string;
  category: string;
}

export interface PodcastEpisodeInfo {
  title: string;
  description: string;
  audioUrl: string;
  duration: number; // in seconds
  publishDate: Date;
  imageUrl?: string;
  episodeNumber?: number;
  seasonNumber?: number;
}

export class PodcastService {
  // Top 6 pickleball podcasts with their RSS feeds
  private static readonly PODCAST_FEEDS = [
    {
      title: 'PicklePod',
      description: 'The premier pickleball podcast hosted by Zane Navratil and Thomas Shields',
      author: 'Zane Navratil, Thomas Shields',
      imageUrl: 'https://i.ytimg.com/vi/D_chHSjaNH8/hqdefault.jpg',
      rssFeedUrl: 'https://feeds.buzzsprout.com/2044651.rss', // Example RSS feed
      websiteUrl: 'https://picklepod.com',
      category: 'Pickleball'
    },
    {
      title: 'Pickleball Studio',
      description: 'In-depth conversations about pickleball technique, strategy, and the mental game',
      author: 'Chris Olson, Will Chang',
      imageUrl: 'https://play-lh.googleusercontent.com/2iZ7TsLtlX37xkHc-rstB8YvelJWaI_7HDYE9OnjPJL9zRK7i5skC5_GR4UKdDU0aA',
      rssFeedUrl: 'https://feeds.buzzsprout.com/1234567.rss', // Example RSS feed
      websiteUrl: 'https://pickleballstudio.com',
      category: 'Pickleball'
    },
    {
      title: 'The McGuffin Show',
      description: 'Tyson and Megan McGuffin discuss professional pickleball and lifestyle',
      author: 'Tyson McGuffin, Megan McGuffin',
      imageUrl: 'https://i.ytimg.com/vi/xvZAfz2P7BA/maxresdefault.jpg',
      rssFeedUrl: 'https://feeds.buzzsprout.com/7654321.rss', // Example RSS feed
      websiteUrl: 'https://mcguffinshow.com',
      category: 'Pickleball'
    },
    {
      title: 'It Feels Right',
      description: 'Rob Nunnery and Adam Stone explore the culture and community of pickleball',
      author: 'Rob Nunnery, Adam Stone',
      imageUrl: 'https://i.ytimg.com/vi/3hmf6Phc1Nk/hqdefault.jpg',
      rssFeedUrl: 'https://feeds.buzzsprout.com/1122334.rss', // Example RSS feed
      websiteUrl: 'https://selkirksport.com/podcast',
      category: 'Pickleball'
    },
    {
      title: 'Pickleball Therapy',
      description: 'Tony Roig focuses on the mental game and psychology of pickleball',
      author: 'Tony Roig',
      imageUrl: 'https://yt3.googleusercontent.com/bBDG8WSGao8NmE2iQSF8U1H3-zoreluGk0QcPlX3-mLskJr2Q-qn4m7jm1FadlZUQn4QdZjtdkA=s160-c-k-c0x00ffffff-no-rj',
      rssFeedUrl: 'https://feeds.buzzsprout.com/5566778.rss', // Example RSS feed
      websiteUrl: 'https://pickleballtherapy.com',
      category: 'Pickleball'
    },
    {
      title: 'Everything But The Kitchen Dink',
      description: 'Conversations about pickleball culture, community, and the latest trends',
      author: 'Robert Rosenfield, Andy Kersh',
      imageUrl: 'https://i.scdn.co/image/ab67656300005f1f006498284bb190fa8b37346d',
      rssFeedUrl: 'https://feeds.buzzsprout.com/9988776.rss', // Example RSS feed
      websiteUrl: 'https://kitchendink.com',
      category: 'Pickleball'
    }
  ];

  static async syncAllPodcastFeeds(): Promise<void> {
    console.log('Starting podcast feed sync...');
    
    for (const podcastInfo of this.PODCAST_FEEDS) {
      try {
        await this.syncPodcastFeed(podcastInfo);
      } catch (error) {
        console.error(`Error syncing podcast ${podcastInfo.title}:`, error);
      }
    }
    
    console.log('Podcast feed sync completed');
  }

  static async syncPodcastFeed(podcastInfo: PodcastShowInfo): Promise<void> {
    try {
      // Check if show already exists
      let show = await prisma.podcastShow.findUnique({
        where: { rssFeedUrl: podcastInfo.rssFeedUrl }
      });

      if (!show) {
        // Create new show
        show = await prisma.podcastShow.create({
          data: {
            title: podcastInfo.title,
            description: podcastInfo.description,
            author: podcastInfo.author,
            imageUrl: podcastInfo.imageUrl,
            rssFeedUrl: podcastInfo.rssFeedUrl,
            websiteUrl: podcastInfo.websiteUrl,
            category: podcastInfo.category
          }
        });
      }

      // Parse RSS feed and get episodes
      const episodes = await this.parseRssFeed(podcastInfo.rssFeedUrl);
      
      // Sync episodes to database
      for (const episode of episodes) {
        await this.syncEpisode(show.id, episode);
      }

      // Update total episodes count
      const episodeCount = await prisma.podcastEpisode.count({
        where: { showId: show.id }
      });

      await prisma.podcastShow.update({
        where: { id: show.id },
        data: { totalEpisodes: episodeCount }
      });

    } catch (error) {
      console.error(`Error syncing podcast feed for ${podcastInfo.title}:`, error);
    }
  }

  static async parseRssFeed(rssFeedUrl: string): Promise<PodcastEpisodeInfo[]> {
    const cacheKey = `rss_feed:${rssFeedUrl}`;
    
    // Try cache first (30 minute cache for RSS feeds)
    const cached = await ApiCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(rssFeedUrl);
      if (!response.ok) {
        throw new Error(`RSS fetch failed: ${response.status}`);
      }

      const rssText = await response.text();
      const episodes = this.parseRssXml(rssText);
      
      await ApiCache.set(cacheKey, episodes, 30);
      return episodes;
    } catch (error) {
      console.error(`Error parsing RSS feed ${rssFeedUrl}:`, error);
      
      // Return sample episodes for development
      return this.getSampleEpisodes();
    }
  }

  private static parseRssXml(xmlString: string): PodcastEpisodeInfo[] {
    // In a real implementation, you'd use a proper XML parser
    // For now, returning sample data
    return this.getSampleEpisodes();
  }

  private static async syncEpisode(showId: string, episode: PodcastEpisodeInfo): Promise<void> {
    try {
      // Check if episode already exists (using audio URL as unique identifier)
      const existingEpisode = await prisma.podcastEpisode.findFirst({
        where: {
          showId,
          audioUrl: episode.audioUrl
        }
      });

      if (!existingEpisode) {
        await prisma.podcastEpisode.create({
          data: {
            showId,
            title: episode.title,
            description: episode.description,
            audioUrl: episode.audioUrl,
            duration: episode.duration,
            publishDate: episode.publishDate,
            imageUrl: episode.imageUrl,
            episodeNumber: episode.episodeNumber,
            seasonNumber: episode.seasonNumber
          }
        });
      }
    } catch (error) {
      console.error('Error syncing episode:', error);
    }
  }

  static async getUserPodcastProgress(userId: string, episodeId: string) {
    return prisma.userPodcastProgress.findUnique({
      where: {
        userId_episodeId: {
          userId,
          episodeId
        }
      }
    });
  }

  static async updatePodcastProgress(
    userId: string, 
    episodeId: string, 
    lastPosition: number, 
    completed = false
  ) {
    return prisma.userPodcastProgress.upsert({
      where: {
        userId_episodeId: {
          userId,
          episodeId
        }
      },
      update: {
        lastPosition,
        completed,
        listenedAt: new Date()
      },
      create: {
        userId,
        episodeId,
        lastPosition,
        completed,
        listenedAt: new Date()
      }
    });
  }

  static async getPodcastEpisodesForTier(showId: string, maxEpisodes: number = -1) {
    const query: any = {
      where: { showId },
      orderBy: { publishDate: 'desc' },
      include: {
        show: true
      }
    };

    if (maxEpisodes > 0) {
      query.take = maxEpisodes;
    }

    return prisma.podcastEpisode.findMany(query);
  }

  // Sample episodes for development
  private static getSampleEpisodes(): PodcastEpisodeInfo[] {
    return [
      {
        title: 'Pro Player Mental Game Strategies',
        description: 'Learn how professional players handle pressure and maintain focus during crucial points',
        audioUrl: 'https://sample-audio.com/episode1.mp3',
        duration: 2340, // 39 minutes
        publishDate: new Date('2024-11-01'),
        episodeNumber: 128,
        seasonNumber: 3
      },
      {
        title: 'The Evolution of Pickleball Equipment',
        description: 'A deep dive into how paddles, balls, and courts have changed the game',
        audioUrl: 'https://sample-audio.com/episode2.mp3',
        duration: 2880, // 48 minutes
        publishDate: new Date('2024-10-25'),
        episodeNumber: 127,
        seasonNumber: 3
      },
      {
        title: 'Building a Pickleball Community',
        description: 'How local clubs and communities are growing the sport nationwide',
        audioUrl: 'https://sample-audio.com/episode3.mp3',
        duration: 2160, // 36 minutes
        publishDate: new Date('2024-10-18'),
        episodeNumber: 126,
        seasonNumber: 3
      }
    ];
  }

  static getPodcastShows() {
    return this.PODCAST_FEEDS;
  }
}
