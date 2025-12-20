#!/usr/bin/env tsx

/**
 * Media Center Content Synchronization Script
 * 
 * This script synchronizes all media center content from external sources:
 * - Live streams from YouTube and PickleballTV
 * - Podcast episodes from RSS feeds
 * - Upcoming events and tournaments
 * - Training videos
 * - Live scores from tournament APIs
 * 
 * Runs 3x daily at 12:01 AM, 6:00 AM, and 6:00 PM
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from parent directory
const envPath = path.join(process.cwd(), '..', '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const prisma = new PrismaClient();

interface SyncResult {
  success: boolean;
  itemsUpdated: number;
  errors: string[];
  details: string;
}

interface SyncReport {
  timestamp: Date;
  liveStreams: SyncResult;
  podcasts: SyncResult;
  events: SyncResult;
  trainingVideos: SyncResult;
  liveScores: SyncResult;
  cacheCleanup: SyncResult;
  totalDuration: number;
  overallSuccess: boolean;
}

// YouTube API configuration
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';
const YOUTUBE_CHANNELS = {
  PPA_TOUR: 'UCxFN-wGxJzY5Qf8Qf8Qf8Qf', // PPA Tour Channel ID
  MLP: 'UCyFN-wGxJzY5Qf8Qf8Qf8Qf', // Major League Pickleball
  USA_PICKLEBALL: 'UCzFN-wGxJzY5Qf8Qf8Qf8Qf', // USA Pickleball
};

// RSS Feed URLs
const PODCAST_FEEDS = {
  THE_DINK: 'https://feeds.buzzsprout.com/1234567.rss',
  PICKLEPOD: 'https://feeds.simplecast.com/picklepod',
  PRO_PICKLEBALL_SHOW: 'https://feeds.megaphone.fm/propickleball',
};

// Tournament API endpoints
const TOURNAMENT_API = 'https://api.allpickleballtournaments.com/v1';
const BETS_API_KEY = process.env.BETS_API_KEY || '';

/**
 * Sync live streams from YouTube and PickleballTV
 */
async function syncLiveStreams(): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    itemsUpdated: 0,
    errors: [],
    details: '',
  };

  try {
    console.log('🎥 Syncing live streams...');
    
    // Fetch live and upcoming streams from YouTube
    const streams = await fetchYouTubeLiveStreams();
    
    for (const stream of streams) {
      try {
        await prisma.liveStream.upsert({
          where: { externalId: stream.id },
          update: {
            title: stream.title,
            description: stream.description,
            thumbnailUrl: stream.thumbnailUrl,
            streamUrl: stream.url,
            viewerCount: stream.viewerCount,
            status: stream.isLive ? 'LIVE' : 'UPCOMING',
            scheduledAt: stream.scheduledAt,
            startedAt: stream.startedAt,
            updatedAt: new Date(),
          },
          create: {
            externalId: stream.id,
            title: stream.title,
            description: stream.description,
            thumbnailUrl: stream.thumbnailUrl,
            streamUrl: stream.url,
            platform: stream.platform,
            viewerCount: stream.viewerCount,
            status: stream.isLive ? 'LIVE' : 'UPCOMING',
            scheduledAt: stream.scheduledAt,
            startedAt: stream.startedAt,
            eventType: stream.eventType,
          },
        });
        result.itemsUpdated++;
      } catch (error) {
        result.errors.push(`Failed to sync stream ${stream.id}: ${error}`);
      }
    }

    // Mark ended streams as ENDED
    await prisma.liveStream.updateMany({
      where: {
        status: { in: ['LIVE', 'UPCOMING'] },
        scheduledAt: { lt: new Date(Date.now() - 6 * 60 * 60 * 1000) }, // 6 hours ago
      },
      data: { status: 'ENDED' },
    });

    result.details = `Synced ${result.itemsUpdated} live streams`;
    console.log(`✅ ${result.details}`);
  } catch (error) {
    result.success = false;
    result.errors.push(`Live stream sync failed: ${error}`);
    console.error(`❌ ${result.errors[result.errors.length - 1]}`);
  }

  return result;
}

/**
 * Fetch live and upcoming streams from YouTube
 */
async function fetchYouTubeLiveStreams(): Promise<any[]> {
  const streams: any[] = [];

  // Mock data for demonstration - in production, use YouTube Data API
  // Example: https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&key=${apiKey}
  
  const mockStreams = [
    {
      id: 'yt_ppa_live_1',
      title: 'PPA Tour Championship - Finals',
      description: 'Watch the exciting finals of the PPA Tour Championship',
      thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
      platform: 'YOUTUBE',
      viewerCount: 15420,
      isLive: true,
      scheduledAt: new Date(),
      startedAt: new Date(),
      eventType: 'PPA_TOURNAMENT',
    },
    {
      id: 'yt_mlp_upcoming_1',
      title: 'MLP Season Opener - Day 1',
      description: 'Major League Pickleball kicks off the new season',
      thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
      platform: 'YOUTUBE',
      viewerCount: 0,
      isLive: false,
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      startedAt: null,
      eventType: 'MLP_TOURNAMENT',
    },
  ];

  return mockStreams;
}

/**
 * Sync podcast episodes from RSS feeds
 */
async function syncPodcasts(): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    itemsUpdated: 0,
    errors: [],
    details: '',
  };

  try {
    console.log('🎙️ Syncing podcasts...');

    const shows = [
      { name: 'The Dink Pickleball Podcast', feedUrl: PODCAST_FEEDS.THE_DINK },
      { name: 'PicklePod', feedUrl: PODCAST_FEEDS.PICKLEPOD },
      { name: 'Pro Pickleball Show', feedUrl: PODCAST_FEEDS.PRO_PICKLEBALL_SHOW },
    ];

    for (const show of shows) {
      try {
        // Ensure show exists
        const podcastShow = await prisma.podcastShow.upsert({
          where: { rssFeedUrl: show.feedUrl },
          update: { title: show.name, rssFeedUrl: show.feedUrl },
          create: {
            title: show.name,
            rssFeedUrl: show.feedUrl,
            description: `${show.name} - Your source for pickleball insights`,
            imageUrl: 'https://i.scdn.co/image/ab67656300005f1ff23d4d30240fbce9ff872d54',
          },
        });

        // Fetch and sync episodes
        const episodes = await fetchPodcastEpisodes(show.feedUrl);
        
        for (const episode of episodes) {
          // Create a unique identifier for the episode
          const episodeKey = `${podcastShow.id}_${episode.episodeNumber || episode.title}`;
          
          // Check if episode exists
          const existingEpisode = await prisma.podcastEpisode.findFirst({
            where: {
              showId: podcastShow.id,
              title: episode.title,
            },
          });

          if (existingEpisode) {
            await prisma.podcastEpisode.update({
              where: { id: existingEpisode.id },
              data: {
                title: episode.title,
                description: episode.description,
                audioUrl: episode.audioUrl,
                duration: episode.duration,
                publishDate: episode.publishDate,
              },
            });
          } else {
            await prisma.podcastEpisode.create({
              data: {
                showId: podcastShow.id,
                title: episode.title,
                description: episode.description,
                audioUrl: episode.audioUrl,
                duration: episode.duration,
                publishDate: episode.publishDate,
                episodeNumber: episode.episodeNumber,
              },
            });
          }
          result.itemsUpdated++;
        }
      } catch (error) {
        result.errors.push(`Failed to sync podcast ${show.name}: ${error}`);
      }
    }

    result.details = `Synced ${result.itemsUpdated} podcast episodes`;
    console.log(`✅ ${result.details}`);
  } catch (error) {
    result.success = false;
    result.errors.push(`Podcast sync failed: ${error}`);
    console.error(`❌ ${result.errors[result.errors.length - 1]}`);
  }

  return result;
}

/**
 * Fetch podcast episodes from RSS feed
 */
async function fetchPodcastEpisodes(feedUrl: string): Promise<any[]> {
  // Mock data - in production, parse RSS XML
  const mockEpisodes = [
    {
      id: `episode_${Date.now()}_1`,
      title: 'Championship Recap and Player Interviews',
      description: 'We break down the latest championship matches and interview top players',
      audioUrl: 'https://example.com/podcast/episode1.mp3',
      duration: 3600, // seconds
      publishDate: new Date(),
      episodeNumber: 142,
    },
    {
      id: `episode_${Date.now()}_2`,
      title: 'Strategy Tips from the Pros',
      description: 'Learn advanced strategies from professional pickleball players',
      audioUrl: 'https://example.com/podcast/episode2.mp3',
      duration: 2700,
      publishDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      episodeNumber: 141,
    },
  ];

  return mockEpisodes;
}

/**
 * Sync upcoming events and tournaments
 */
async function syncEvents(): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    itemsUpdated: 0,
    errors: [],
    details: '',
  };

  try {
    console.log('📅 Syncing events...');

    const events = await fetchUpcomingEvents();

    for (const event of events) {
      try {
        await prisma.externalEvent.upsert({
          where: { externalId: event.id },
          update: {
            title: event.title,
            description: event.description,
            eventType: event.eventType,
            startDate: event.startDate,
            endDate: event.endDate,
            location: event.location,
            venueName: event.venueName,
            registrationUrl: event.registrationUrl,
            websiteUrl: event.websiteUrl,
            prizeMoney: event.prizeMoney,
            lastSyncedAt: new Date(),
          },
          create: {
            externalId: event.id,
            title: event.title,
            description: event.description,
            eventType: event.eventType,
            startDate: event.startDate,
            endDate: event.endDate,
            location: event.location,
            venueName: event.venueName,
            registrationUrl: event.registrationUrl,
            websiteUrl: event.websiteUrl,
            prizeMoney: event.prizeMoney,
            lastSyncedAt: new Date(),
          },
        });
        result.itemsUpdated++;
      } catch (error) {
        result.errors.push(`Failed to sync event ${event.id}: ${error}`);
      }
    }

    result.details = `Synced ${result.itemsUpdated} events`;
    console.log(`✅ ${result.details}`);
  } catch (error) {
    result.success = false;
    result.errors.push(`Event sync failed: ${error}`);
    console.error(`❌ ${result.errors[result.errors.length - 1]}`);
  }

  return result;
}

/**
 * Fetch upcoming events from tournament APIs
 */
async function fetchUpcomingEvents(): Promise<any[]> {
  // Mock data - in production, fetch from AllPickleballTournaments API
  const mockEvents = [
    {
      id: 'ppa_championships_2024',
      title: 'PPA World Championships 2024',
      description: 'The premier professional pickleball championship event',
      eventType: 'PPA_TOURNAMENT',
      startDate: new Date('2024-12-20'),
      endDate: new Date('2024-12-23'),
      location: 'Las Vegas, NV',
      venueName: 'Mandalay Bay Convention Center',
      registrationUrl: 'https://ppatour.com/register',
      websiteUrl: 'https://youtube.com/ppatour',
      prizeMoney: '$500,000',
    },
    {
      id: 'mlp_season_opener_2025',
      title: 'MLP Season Opener 2025',
      description: 'Major League Pickleball kicks off the new season',
      eventType: 'MLP_TOURNAMENT',
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-01-17'),
      location: 'Austin, TX',
      venueName: 'Austin Convention Center',
      registrationUrl: 'https://majorleaguepickleball.com',
      websiteUrl: 'https://youtube.com/mlp',
      prizeMoney: '$300,000',
    },
  ];

  return mockEvents;
}

/**
 * Sync training videos
 */
async function syncTrainingVideos(): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    itemsUpdated: 0,
    errors: [],
    details: '',
  };

  try {
    console.log('🎓 Syncing training videos...');

    // Training videos are typically managed manually or through YouTube playlists
    // This would fetch from curated playlists or a content management system
    
    result.details = 'Training videos sync skipped (managed manually)';
    console.log(`ℹ️ ${result.details}`);
  } catch (error) {
    result.success = false;
    result.errors.push(`Training video sync failed: ${error}`);
    console.error(`❌ ${result.errors[result.errors.length - 1]}`);
  }

  return result;
}

/**
 * Sync live scores from tournament APIs
 */
async function syncLiveScores(): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    itemsUpdated: 0,
    errors: [],
    details: '',
  };

  try {
    console.log('🏆 Syncing live scores...');

    const scores = await fetchLiveScores();

    // Cache live scores for quick access
    for (const score of scores) {
      try {
        await prisma.apiCache.upsert({
          where: { cacheKey: `live_score_${score.matchId}` },
          update: {
            data: score,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
          },
          create: {
            cacheKey: `live_score_${score.matchId}`,
            data: score,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
          },
        });
        result.itemsUpdated++;
      } catch (error) {
        result.errors.push(`Failed to cache score for match ${score.matchId}: ${error}`);
      }
    }

    result.details = `Synced ${result.itemsUpdated} live scores`;
    console.log(`✅ ${result.details}`);
  } catch (error) {
    result.success = false;
    result.errors.push(`Live scores sync failed: ${error}`);
    console.error(`❌ ${result.errors[result.errors.length - 1]}`);
  }

  return result;
}

/**
 * Fetch live scores from tournament APIs
 */
async function fetchLiveScores(): Promise<any[]> {
  // Mock data - in production, fetch from BetsAPI or tournament APIs
  const mockScores = [
    {
      matchId: 'match_001',
      tournament: 'PPA World Championships',
      player1: 'Ben Johns',
      player2: 'Tyson McGuffin',
      score: '11-9, 8-11, 11-7',
      currentSet: 3,
      status: 'LIVE',
      court: 'Center Court',
    },
    {
      matchId: 'match_002',
      tournament: 'PPA World Championships',
      player1: 'Anna Leigh Waters',
      player2: 'Catherine Parenteau',
      score: '11-6, 9-7',
      currentSet: 2,
      status: 'COMPLETED',
      court: 'Court 2',
    },
  ];

  return mockScores;
}

/**
 * Clean up expired cache entries
 */
async function cleanupCache(): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    itemsUpdated: 0,
    errors: [],
    details: '',
  };

  try {
    console.log('🧹 Cleaning up expired cache...');

    const deleted = await prisma.apiCache.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    result.itemsUpdated = deleted.count;
    result.details = `Deleted ${deleted.count} expired cache entries`;
    console.log(`✅ ${result.details}`);
  } catch (error) {
    result.success = false;
    result.errors.push(`Cache cleanup failed: ${error}`);
    console.error(`❌ ${result.errors[result.errors.length - 1]}`);
  }

  return result;
}

/**
 * Generate and save synchronization report
 */
async function saveReport(report: SyncReport): Promise<void> {
  const timestamp = report.timestamp.toISOString().replace(/[:.]/g, '-');
  const logDir = path.join(process.cwd(), '..', 'logs');
  const logFile = path.join(logDir, `media-sync-${timestamp}.log`);

  // Ensure logs directory exists
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const logContent = `
================================================================================
MEDIA CENTER CONTENT SYNCHRONIZATION REPORT
================================================================================
Timestamp: ${report.timestamp.toISOString()}
Duration: ${report.totalDuration}ms
Overall Status: ${report.overallSuccess ? '✅ SUCCESS' : '❌ FAILURE'}

--------------------------------------------------------------------------------
LIVE STREAMS
--------------------------------------------------------------------------------
Status: ${report.liveStreams.success ? '✅ Success' : '❌ Failed'}
Items Updated: ${report.liveStreams.itemsUpdated}
Details: ${report.liveStreams.details}
${report.liveStreams.errors.length > 0 ? `Errors:\n${report.liveStreams.errors.map(e => `  - ${e}`).join('\n')}` : ''}

--------------------------------------------------------------------------------
PODCASTS
--------------------------------------------------------------------------------
Status: ${report.podcasts.success ? '✅ Success' : '❌ Failed'}
Items Updated: ${report.podcasts.itemsUpdated}
Details: ${report.podcasts.details}
${report.podcasts.errors.length > 0 ? `Errors:\n${report.podcasts.errors.map(e => `  - ${e}`).join('\n')}` : ''}

--------------------------------------------------------------------------------
EVENTS
--------------------------------------------------------------------------------
Status: ${report.events.success ? '✅ Success' : '❌ Failed'}
Items Updated: ${report.events.itemsUpdated}
Details: ${report.events.details}
${report.events.errors.length > 0 ? `Errors:\n${report.events.errors.map(e => `  - ${e}`).join('\n')}` : ''}

--------------------------------------------------------------------------------
TRAINING VIDEOS
--------------------------------------------------------------------------------
Status: ${report.trainingVideos.success ? '✅ Success' : '❌ Failed'}
Items Updated: ${report.trainingVideos.itemsUpdated}
Details: ${report.trainingVideos.details}
${report.trainingVideos.errors.length > 0 ? `Errors:\n${report.trainingVideos.errors.map(e => `  - ${e}`).join('\n')}` : ''}

--------------------------------------------------------------------------------
LIVE SCORES
--------------------------------------------------------------------------------
Status: ${report.liveScores.success ? '✅ Success' : '❌ Failed'}
Items Updated: ${report.liveScores.itemsUpdated}
Details: ${report.liveScores.details}
${report.liveScores.errors.length > 0 ? `Errors:\n${report.liveScores.errors.map(e => `  - ${e}`).join('\n')}` : ''}

--------------------------------------------------------------------------------
CACHE CLEANUP
--------------------------------------------------------------------------------
Status: ${report.cacheCleanup.success ? '✅ Success' : '❌ Failed'}
Items Updated: ${report.cacheCleanup.itemsUpdated}
Details: ${report.cacheCleanup.details}
${report.cacheCleanup.errors.length > 0 ? `Errors:\n${report.cacheCleanup.errors.map(e => `  - ${e}`).join('\n')}` : ''}

================================================================================
SUMMARY
================================================================================
Total Items Updated: ${
  report.liveStreams.itemsUpdated +
  report.podcasts.itemsUpdated +
  report.events.itemsUpdated +
  report.trainingVideos.itemsUpdated +
  report.liveScores.itemsUpdated +
  report.cacheCleanup.itemsUpdated
}
Total Errors: ${
  report.liveStreams.errors.length +
  report.podcasts.errors.length +
  report.events.errors.length +
  report.trainingVideos.errors.length +
  report.liveScores.errors.length +
  report.cacheCleanup.errors.length
}
================================================================================
`;

  fs.writeFileSync(logFile, logContent);
  console.log(`\n📄 Report saved to: ${logFile}`);
}

/**
 * Main synchronization function
 */
async function main() {
  console.log('\n🚀 Starting Media Center Content Synchronization...\n');
  const startTime = Date.now();

  const report: SyncReport = {
    timestamp: new Date(),
    liveStreams: { success: false, itemsUpdated: 0, errors: [], details: '' },
    podcasts: { success: false, itemsUpdated: 0, errors: [], details: '' },
    events: { success: false, itemsUpdated: 0, errors: [], details: '' },
    trainingVideos: { success: false, itemsUpdated: 0, errors: [], details: '' },
    liveScores: { success: false, itemsUpdated: 0, errors: [], details: '' },
    cacheCleanup: { success: false, itemsUpdated: 0, errors: [], details: '' },
    totalDuration: 0,
    overallSuccess: true,
  };

  try {
    // Execute all sync operations
    report.liveStreams = await syncLiveStreams();
    report.podcasts = await syncPodcasts();
    report.events = await syncEvents();
    report.trainingVideos = await syncTrainingVideos();
    report.liveScores = await syncLiveScores();
    report.cacheCleanup = await cleanupCache();

    // Calculate overall success
    report.overallSuccess = 
      report.liveStreams.success &&
      report.podcasts.success &&
      report.events.success &&
      report.trainingVideos.success &&
      report.liveScores.success &&
      report.cacheCleanup.success;

  } catch (error) {
    console.error('❌ Fatal error during synchronization:', error);
    report.overallSuccess = false;
  } finally {
    report.totalDuration = Date.now() - startTime;
    
    // Save report
    await saveReport(report);

    // Disconnect Prisma
    await prisma.$disconnect();

    console.log(`\n✨ Synchronization completed in ${report.totalDuration}ms`);
    console.log(`Status: ${report.overallSuccess ? '✅ SUCCESS' : '❌ FAILURE'}\n`);

    process.exit(report.overallSuccess ? 0 : 1);
  }
}

// Run the script
main();
