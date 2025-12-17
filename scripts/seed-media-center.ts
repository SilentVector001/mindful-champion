
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function seedMediaCenter() {
  console.log('🎬 Starting Media Center seeding...');
  
  try {
    // Read the research data file
    const researchDataPath = path.join(process.cwd(), '../../pickleball_media_research.json');
    const researchData = JSON.parse(fs.readFileSync(researchDataPath, 'utf8'));
    
    console.log('📊 Research data loaded:', {
      podcasts: researchData.podcasts?.length || 0,
      organizations: researchData.tournament_organizations?.length || 0,
      streaming_platforms: researchData.streaming_platforms?.length || 0,
      major_events: researchData.major_events_2025?.length || 0
    });

    // 1. Seed Streaming Platforms
    console.log('🎥 Seeding streaming platforms...');
    const streamingPlatforms = researchData.streaming_platforms || [];
    
    for (const platform of streamingPlatforms) {
      await prisma.streamingPlatform.upsert({
        where: { platformId: platform.id },
        update: {
          name: platform.name,
          description: platform.description,
          officialWebsite: platform.official_website || platform.website || platform.streaming_url,
          streamingUrl: platform.streaming_url || platform.website,
          type: mapPlatformType(platform.type),
          subscriptionCost: platform.subscription?.monthly || platform.cost || null,
          hasFreeAccess: platform.type === 'Free' || platform.hasFreeAccess === true,
          freeAccessDetails: platform.free_options || platform.features,
          features: platform.features || [],
          content: platform.content || platform.coverage || [],
          platforms: platform.platforms || [],
          tierAccess: determineTierAccess(platform.type),
        },
        create: {
          platformId: platform.id,
          name: platform.name,
          description: platform.description || '',
          officialWebsite: platform.official_website || platform.website || platform.streaming_url,
          streamingUrl: platform.streaming_url || platform.website,
          type: mapPlatformType(platform.type),
          subscriptionCost: platform.subscription?.monthly || platform.cost || null,
          hasFreeAccess: platform.type === 'Free' || platform.hasFreeAccess === true,
          freeAccessDetails: platform.free_options || platform.features,
          features: platform.features || [],
          content: platform.content || platform.coverage || [],
          platforms: platform.platforms || [],
          tierAccess: determineTierAccess(platform.type),
        }
      });
    }

    // 2. Seed Tournament Organizations
    console.log('🏆 Seeding tournament organizations...');
    const organizations = researchData.tournament_organizations || [];
    
    for (const org of organizations) {
      await prisma.tournamentOrganization.upsert({
        where: { organizationId: org.id },
        update: {
          name: org.name,
          fullName: org.full_name || org.name,
          description: org.description,
          websiteUrl: org.official_website || org.website,
          type: mapOrganizationType(org.id),
          socialLinks: org.social_media || {},
          headquarters: org.headquarters?.location || org.headquarters,
          foundedYear: org.founded || org.foundedYear,
        },
        create: {
          organizationId: org.id,
          name: org.name,
          fullName: org.full_name || org.name,
          description: org.description || '',
          websiteUrl: org.official_website || org.website,
          type: mapOrganizationType(org.id),
          socialLinks: org.social_media || {},
          headquarters: org.headquarters?.location || org.headquarters,
          foundedYear: org.founded || org.foundedYear,
        }
      });
    }

    // 3. Create Podcast Shows (skipped - model may not exist yet)
    console.log('🎙️ Skipping podcast shows seeding (model may not exist)...');
    
    // 4. Create External Events (skipped - model may not exist yet)
    console.log('📅 Skipping events seeding (model may not exist)...');

    console.log('✅ Media Center seeding completed successfully!');
    
    // Show final counts
    const counts: any = {
      streamingPlatforms: await prisma.streamingPlatform.count(),
      tournamentOrganizations: await prisma.tournamentOrganization.count(),
    };
    
    console.log('📊 Final counts:', counts);
    
  } catch (error) {
    console.error('❌ Error seeding media center:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Helper functions for mapping data
function mapPlatformType(type: string): 'FREE' | 'SUBSCRIPTION' | 'FREEMIUM' | 'CABLE' | 'PAY_PER_VIEW' {
  if (!type) return 'SUBSCRIPTION';
  
  const typeMap: { [key: string]: 'FREE' | 'SUBSCRIPTION' | 'FREEMIUM' | 'CABLE' | 'PAY_PER_VIEW' } = {
    'Free': 'FREE',
    'Subscription': 'SUBSCRIPTION',
    'Subscription (with free tier options)': 'FREEMIUM',
    'Subscription (ESPN+) and Cable': 'CABLE',
    'Cable': 'CABLE',
    'Cable and streaming': 'CABLE',
    'Pay per view': 'PAY_PER_VIEW'
  };
  
  return typeMap[type] || 'SUBSCRIPTION';
}

function determineTierAccess(type: string): 'FREE' | 'PREMIUM' {
  if (type === 'Free' || type === 'Free streaming') return 'FREE';
  if (type?.includes('free tier') || type?.includes('Free')) return 'FREE';
  return 'PREMIUM';
}

function mapOrganizationType(id: string): 'PPA_TOUR' | 'APP_TOUR' | 'MLP' | 'USA_PICKLEBALL' | 'OTHER' {
  const typeMap: { [key: string]: 'PPA_TOUR' | 'APP_TOUR' | 'MLP' | 'USA_PICKLEBALL' | 'OTHER' } = {
    'ppa-tour': 'PPA_TOUR',
    'app-tour': 'APP_TOUR',
    'mlp': 'MLP',
    'npl': 'OTHER',
    'usa-pickleball': 'USA_PICKLEBALL'
  };
  
  return typeMap[id] || 'OTHER';
}

function mapEventType(organization: string): 'PPA_TOUR' | 'APP_TOUR' | 'MLP' | 'USA_PICKLEBALL' | 'OTHER' {
  const typeMap: { [key: string]: 'PPA_TOUR' | 'APP_TOUR' | 'MLP' | 'USA_PICKLEBALL' | 'OTHER' } = {
    'PPA Tour': 'PPA_TOUR',
    'APP Tour': 'APP_TOUR',
    'Major League Pickleball': 'MLP',
    'USA Pickleball': 'USA_PICKLEBALL',
    'ESPN': 'OTHER'
  };
  
  return typeMap[organization] || 'OTHER';
}

// Run the seeding
if (require.main === module) {
  seedMediaCenter()
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export { seedMediaCenter };
