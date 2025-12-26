
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Sample podcast data from research (since PodcastShow model doesn't exist yet)
const PODCAST_DATA = [
  {
    id: "picklepod",
    name: "PicklePod",
    description: "The top pickleball podcast covering tournament recaps, player strategies, and pop-culture aspects of pickleball with a professional and entertaining vibe",
    hosts: ["Zane Navratil", "Thomas Shields"],
    platforms: {
      website: "https://www.picklepod.com",
      apple_podcasts: "https://podcasts.apple.com/picklepod",
      spotify: "https://open.spotify.com/show/picklepod",
      youtube: "https://www.youtube.com/picklepod"
    },
    episode_frequency: "Weekly",
    average_episode_length: "70 minutes",
    format: "Long-form",
    apple_rating: 4.6,
    target_audience: ["Professional", "Advanced", "General"],
    social_media: {
      instagram: "@picklepod",
      instagram_followers: "201.2K"
    },
    focus_areas: ["Tournament Recaps", "Player Strategies", "Pop Culture", "Insider Updates"],
    tier_requirement: "FREE"
  },
  {
    id: "pickleball-studio",
    name: "Pickleball Studio Podcast",
    description: "Unbiased paddle reviews, news, and strategies with high energy and knowledge, making it educational for all skill levels",
    hosts: ["Chris Olson", "Will Chaing"],
    platforms: {
      website: "https://www.pickleballstudio.com",
      apple_podcasts: "https://podcasts.apple.com/pickleball-studio",
      spotify: "https://open.spotify.com/show/pickleball-studio",
      youtube: "https://www.youtube.com/pickleballstudio"
    },
    episode_frequency: "Weekly",
    average_episode_length: "83 minutes",
    format: "Long-form with video content",
    apple_rating: 4.8,
    target_audience: ["Beginners", "Intermediate", "Advanced"],
    focus_areas: ["Paddle Reviews", "Equipment", "News", "Strategies", "Beginner Tips"],
    tier_requirement: "FREE"
  },
  {
    id: "it-feels-right",
    name: "It Feels Right Pickleball Podcast",
    description: "Pro game insights, amateur improvement tips, and pop culture with fun and knowledgeable hosts. Produced by Selkirk Sport",
    hosts: ["Rob Nunnery", "Adam Stone"],
    platforms: {
      website: "https://www.selkirk.com/podcast",
      apple_podcasts: "https://podcasts.apple.com/it-feels-right",
      spotify: "https://open.spotify.com/show/it-feels-right",
      youtube: "https://www.youtube.com/itfeelsright"
    },
    episode_frequency: "Weekly",
    average_episode_length: "44 minutes",
    format: "Long-form",
    apple_rating: 4.9,
    target_audience: ["Amateur", "Professional", "General"],
    sponsor: "Selkirk Sport",
    focus_areas: ["Pro Game Insights", "Amateur Improvement", "Pop Culture", "Guest Interviews"],
    tier_requirement: "FREE"
  },
  {
    id: "mcguffin-show",
    name: "The McGuffin Show",
    description: "Fan favorite covering tournaments, coaching tips, and personal stories with entertaining rapport between hosts",
    hosts: ["Tyson McGuffin", "Megan McGuffin"],
    platforms: {
      website: "https://www.themcguffinshow.com",
      apple_podcasts: "https://podcasts.apple.com/mcguffin-show",
      spotify: "https://open.spotify.com/show/mcguffin-show",
      youtube: "https://www.youtube.com/mcguffinshow"
    },
    episode_frequency: "Weekly",
    average_episode_length: "56 minutes",
    format: "Long-form",
    apple_rating: 4.0,
    target_audience: ["General", "Fans", "Players"],
    social_media: {
      instagram: "@themcguffinshow",
      instagram_followers: "114.7K"
    },
    focus_areas: ["Tournaments", "Coaching Tips", "Personal Stories", "Off-Court Topics"],
    tier_requirement: "FREE"
  },
  {
    id: "third-shot",
    name: "Third Shot - A Pickleball Podcast",
    description: "Game aspects, product reviews, and guest stories with a focus on community and equipment advice",
    hosts: ["Brigie", "Uncle Greg"],
    platforms: {
      website: "https://www.thirdshotpodcast.com",
      apple_podcasts: "https://podcasts.apple.com/third-shot",
      spotify: "https://open.spotify.com/show/third-shot"
    },
    episode_frequency: "Weekly",
    average_episode_length: "44 minutes",
    format: "Long-form",
    apple_rating: 5.0,
    target_audience: ["All Levels", "Community"],
    focus_areas: ["Game Strategy", "Product Reviews", "Guest Stories", "Equipment Advice"],
    tier_requirement: "FREE"
  },
  {
    id: "pickleball-therapy",
    name: "Pickleball Therapy",
    description: "Mental game improvement and strategic awareness with short-form episodes perfect for quick learning",
    hosts: ["Tony Roig"],
    platforms: {
      website: "https://www.pickleballtherapy.com",
      apple_podcasts: "https://podcasts.apple.com/us/podcast/pickleball-therapy/id1523311733",
      spotify: "https://open.spotify.com/show/3LwEo9b6svAvG5tXwYpUfo",
      youtube: "https://www.youtube.com/pickleballtherapy"
    },
    episode_frequency: "Multiple per week",
    average_episode_length: "19 minutes",
    format: "Short-form",
    apple_rating: 4.8,
    target_audience: ["Mental Game", "All Levels"],
    focus_areas: ["Mental Strategy", "Performance Psychology", "Mindset", "Strategic Awareness"],
    tier_requirement: "PREMIUM"
  },
  {
    id: "king-of-court",
    name: "King of the Court",
    description: "Tournament drama and rivalries with edgy content and high entertainment value",
    hosts: ["Tyler Loong", "Jimmy Miller"],
    platforms: {
      apple_podcasts: "https://podcasts.apple.com/king-of-court",
      spotify: "https://open.spotify.com/show/king-of-court",
      youtube: "https://www.youtube.com/kingofthecourt"
    },
    episode_frequency: "Weekly",
    average_episode_length: "60-90 minutes",
    format: "Long-form",
    target_audience: ["Entertainment", "Drama Fans", "Professional"],
    focus_areas: ["Tournament Drama", "Rivalries", "Entertainment", "Edgy Content"],
    tier_requirement: "PREMIUM"
  },
  {
    id: "tennis-sucks",
    name: "Tennis Sucks Podcast",
    description: "Casual, humorous tone covering news with a focus on entertainment",
    hosts: ["Travis Rettenmaier", "Graham D'Amico"],
    platforms: {
      apple_podcasts: "https://podcasts.apple.com/tennis-sucks",
      spotify: "https://open.spotify.com/show/tennis-sucks",
      youtube: "https://www.youtube.com/tennissucks"
    },
    episode_frequency: "Weekly",
    average_episode_length: "30-45 minutes",
    format: "Medium-form",
    target_audience: ["Casual", "Entertainment"],
    content_warning: "May contain explicit language",
    focus_areas: ["News", "Entertainment", "Humor"],
    tier_requirement: "FREE"
  },
  {
    id: "eddie-webby",
    name: "The Eddie and Webby Pickleball Podcast",
    description: "Lighthearted fun with high production value, known for longevity and classic entertainment",
    hosts: ["Eddie", "Webby Webovich"],
    platforms: {
      apple_podcasts: "https://podcasts.apple.com/eddie-webby",
      spotify: "https://open.spotify.com/show/eddie-webby"
    },
    episode_frequency: "Weekly",
    average_episode_length: "38-46 minutes",
    format: "Medium-form",
    target_audience: ["Entertainment", "General"],
    focus_areas: ["Entertainment", "Lighthearted Content", "Community"],
    tier_requirement: "FREE"
  },
  {
    id: "pickleball-tips-pro",
    name: "Pickleball Tips - 4.0 To Pro",
    description: "Pocket-sized podcast focusing on specific skills with short, actionable episodes for skill improvement",
    hosts: ["Michael O'Neal", "Mircea Morariu"],
    platforms: {
      apple_podcasts: "https://podcasts.apple.com/us/podcast/pickleball-tips-4-0-to-pro-a-pocket-sized-pickleball-podcast/id1672463911"
    },
    episode_frequency: "Weekly",
    average_episode_length: "20-45 minutes",
    format: "Short to Medium-form",
    apple_rating: 4.8,
    target_audience: ["Intermediate", "Advanced", "Skill Development"],
    focus_areas: ["Skill Improvement", "Specific Techniques", "4.0+ Players"],
    tier_requirement: "PREMIUM"
  },
  {
    id: "pickleball-kitchen",
    name: "Pickleball Kitchen Podcast",
    description: "Strategies, tips, and equipment reviews suitable for beginners and intermediate players",
    hosts: ["Barrett Kincheloe"],
    platforms: {
      apple_podcasts: "https://podcasts.apple.com/pickleball-kitchen",
      spotify: "https://open.spotify.com/show/pickleball-kitchen",
      youtube: "https://www.youtube.com/pickleballkitchen"
    },
    episode_frequency: "Weekly",
    average_episode_length: "44 minutes",
    format: "Long-form",
    apple_rating: 4.6,
    target_audience: ["Beginners", "Intermediate"],
    focus_areas: ["Strategies", "Tips", "Equipment Reviews"],
    tier_requirement: "FREE"
  },
  {
    id: "thinking-dinking",
    name: "Thinking and Dinking",
    description: "Sports and pickleball discussion with humorous tone and engaging conversation",
    hosts: ["Trevor", "Isaac"],
    platforms: {
      apple_podcasts: "https://podcasts.apple.com/thinking-dinking",
      spotify: "https://open.spotify.com/show/thinking-dinking",
      youtube: "https://www.youtube.com/thinkingdinking"
    },
    episode_frequency: "Weekly",
    average_episode_length: "43 minutes",
    format: "Medium-form",
    apple_rating: 4.9,
    target_audience: ["Sports Fans", "General"],
    focus_areas: ["Sports Discussion", "Humor", "Pickleball Culture"],
    tier_requirement: "FREE"
  },
  {
    id: "pickleball-problems",
    name: "Pickleball Problems",
    description: "Advice on game challenges with short-form episodes, featuring Canadian perspective",
    hosts: ["Mark Renneson"],
    platforms: {
      apple_podcasts: "https://podcasts.apple.com/pickleball-problems",
      spotify: "https://open.spotify.com/show/pickleball-problems"
    },
    episode_frequency: "Multiple per week",
    average_episode_length: "13 minutes",
    format: "Short-form",
    apple_rating: 4.4,
    target_audience: ["All Levels", "Problem Solving"],
    region: "Canada",
    focus_areas: ["Game Challenges", "Problem Solving", "Quick Tips"],
    tier_requirement: "FREE"
  },
  {
    id: "this-pickleball-life",
    name: "This Pickleball Life",
    description: "News, advice, and humor with entertainment and instruction focus",
    hosts: ["Jill Braverman", "Kristin Walla"],
    platforms: {
      apple_podcasts: "https://podcasts.apple.com/us/podcast/this-pickleball-life/id1678021752",
      spotify: "https://open.spotify.com/show/this-pickleball-life",
      youtube: "https://www.youtube.com/thispickleballlife"
    },
    episode_frequency: "Semiweekly",
    average_episode_length: "60-90 minutes",
    format: "Long-form",
    target_audience: ["General", "Entertainment"],
    focus_areas: ["News", "Advice", "Humor", "Entertainment"],
    tier_requirement: "FREE"
  },
  {
    id: "morgan-evans",
    name: "Morgan Evans More or Less",
    description: "Pickleball insights and commentary from professional player Morgan Evans",
    hosts: ["Morgan Evans"],
    platforms: {
      apple_podcasts: "https://podcasts.apple.com/morgan-evans",
      spotify: "https://open.spotify.com/show/morgan-evans",
      youtube: "https://www.youtube.com/morganevans"
    },
    episode_frequency: "Weekly",
    format: "Medium-form",
    target_audience: ["Professional", "Advanced"],
    focus_areas: ["Pro Insights", "Commentary", "Player Perspective"],
    tier_requirement: "PREMIUM"
  },
  {
    id: "pickle-juice",
    name: "Pickle Juice",
    description: "Community-focused podcast with multiple hosts covering various pickleball topics",
    hosts: ["Zook", "Norway Johnny", "Others"],
    platforms: {
      apple_podcasts: "https://podcasts.apple.com/pickle-juice",
      spotify: "https://open.spotify.com/show/pickle-juice",
      youtube: "https://www.youtube.com/picklejuice"
    },
    episode_frequency: "Weekly",
    format: "Long-form",
    target_audience: ["Community", "General"],
    focus_areas: ["Community", "Various Topics", "Entertainment"],
    tier_requirement: "FREE"
  },
  {
    id: "zero-zero-start",
    name: "Zero Zero Start",
    description: "Industry insights and pickleball business perspectives",
    hosts: ["Various"],
    platforms: {
      apple_podcasts: "https://podcasts.apple.com/zero-zero-start",
      spotify: "https://open.spotify.com/show/zero-zero-start"
    },
    episode_frequency: "Weekly",
    format: "Medium-form",
    target_audience: ["Industry", "Business"],
    focus_areas: ["Industry Insights", "Business", "Growth"],
    tier_requirement: "PREMIUM"
  },
  {
    id: "inside-mlp",
    name: "Inside Major League Pickleball",
    description: "Official MLP podcast covering team competitions, player interviews, and league insights",
    hosts: ["MLP Production Team"],
    platforms: {
      apple_podcasts: "https://podcasts.apple.com/inside-mlp",
      spotify: "https://open.spotify.com/show/inside-mlp",
      youtube: "https://www.youtube.com/majorleaguepickleball"
    },
    episode_frequency: "Weekly during season",
    format: "Medium-form",
    target_audience: ["MLP Fans", "Team Competition"],
    focus_areas: ["MLP Coverage", "Team Competition", "Player Interviews"],
    tier_requirement: "PREMIUM"
  }
];

function getUserTier(session: any): 'FREE' | 'TRIAL' | 'PREMIUM' | 'PRO' {
  // Mock tier determination - in real app this would come from user's subscription
  return 'TRIAL'; // For demo purposes, user has trial access
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    
    const audience = searchParams.get('audience');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'rating';
    
    const userTier = session ? getUserTier(session) : 'FREE';
    
    // Filter podcasts based on user's tier
    let filteredPodcasts = PODCAST_DATA.filter(podcast => {
      if (userTier === 'FREE' && podcast.tier_requirement === 'PREMIUM') {
        return false;
      }
      return true;
    });
    
    // Apply audience filter
    if (audience && audience !== 'all') {
      filteredPodcasts = filteredPodcasts.filter(podcast =>
        podcast.target_audience.some(aud => 
          aud.toLowerCase().includes(audience.toLowerCase())
        )
      );
    }
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPodcasts = filteredPodcasts.filter(podcast =>
        podcast.name.toLowerCase().includes(searchLower) ||
        podcast.description.toLowerCase().includes(searchLower) ||
        podcast.hosts.some(host => host.toLowerCase().includes(searchLower)) ||
        podcast.focus_areas.some(area => area.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply sorting
    switch (sort) {
      case 'rating':
        filteredPodcasts.sort((a, b) => (b.apple_rating || 0) - (a.apple_rating || 0));
        break;
      case 'name':
        filteredPodcasts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'frequency':
        const freqOrder: { [key: string]: number } = { 'Multiple per week': 0, 'Semiweekly': 1, 'Weekly': 2, 'Weekly during season': 3 };
        filteredPodcasts.sort((a, b) => (freqOrder[a.episode_frequency] || 99) - (freqOrder[b.episode_frequency] || 99));
        break;
      default:
        break;
    }
    
    return NextResponse.json({
      success: true,
      podcasts: filteredPodcasts,
      totalCount: filteredPodcasts.length,
      userTier,
      availableAudiences: ["Beginners", "Intermediate", "Advanced", "Professional", "General", "Entertainment", "Mental Game", "Industry"],
      availableFocusAreas: [
        "Tournament Recaps", "Player Strategies", "Equipment", "News", "Strategies", 
        "Mental Strategy", "Entertainment", "Skill Improvement", "Community", "Industry Insights"
      ]
    });
    
  } catch (error) {
    console.error('Error fetching podcasts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch podcasts' },
      { status: 500 }
    );
  }
}
