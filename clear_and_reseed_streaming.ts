import { prisma } from './lib/db';
import * as fs from 'fs';
import * as path from 'path';

async function clearAndReseedStreaming() {
  console.log('🧹 Clearing existing streaming platforms...');
  
  try {
    // Delete all existing streaming platforms
    const deleted = await prisma.streamingPlatform.deleteMany({});
    console.log(`   Deleted ${deleted.count} existing platforms`);
    
    // Read the updated research data file
    const researchDataPath = path.join(process.cwd(), '../../pickleball_media_research.json');
    const researchData = JSON.parse(fs.readFileSync(researchDataPath, 'utf8'));
    
    console.log('📊 Updated research data loaded:', {
      streaming_platforms: researchData.streaming_platforms?.length || 0
    });

    // Re-seed Streaming Platforms with pickleball-specific content only
    console.log('🎥 Reseeding streaming platforms (pickleball-specific only)...');
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
          hasFreeAccess: platform.type === 'Free' || platform.type === 'Free streaming' || platform.hasFreeAccess === true,
          freeAccessDetails: platform.free_options || platform.subscription?.free_options || platform.features,
          features: platform.features || [],
          content: platform.content || platform.coverage || [],
          platforms: platform.platforms || [],
          tierAccess: determineTierAccess(platform.type),
          isActive: true,
        },
        create: {
          platformId: platform.id,
          name: platform.name,
          description: platform.description || '',
          officialWebsite: platform.official_website || platform.website || platform.streaming_url,
          streamingUrl: platform.streaming_url || platform.website,
          type: mapPlatformType(platform.type),
          subscriptionCost: platform.subscription?.monthly || platform.cost || null,
          hasFreeAccess: platform.type === 'Free' || platform.type === 'Free streaming' || platform.hasFreeAccess === true,
          freeAccessDetails: platform.free_options || platform.subscription?.free_options || platform.features,
          features: platform.features || [],
          content: platform.content || platform.coverage || [],
          platforms: platform.platforms || [],
          tierAccess: determineTierAccess(platform.type),
          isActive: true,
        }
      });
    }

    console.log(`✅ Created ${streamingPlatforms.length} pickleball-specific streaming platforms`);
    
    // Show final count
    const finalCount = await prisma.streamingPlatform.count();
    console.log('📊 Final streaming platform count:', finalCount);
    
    // List all platforms
    const allPlatforms = await prisma.streamingPlatform.findMany({
      orderBy: { name: 'asc' }
    });
    
    console.log('\n📺 Streaming platforms in database:');
    allPlatforms.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name} (${p.type}, ${p.hasFreeAccess ? 'FREE ACCESS' : 'SUBSCRIPTION'})`);
    });
    
  } catch (error) {
    console.error('❌ Error clearing and reseeding:', error);
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
    'Free streaming': 'FREE',
    'Subscription': 'SUBSCRIPTION',
    'Subscription (with free tier options)': 'FREEMIUM',
    'Subscription with free tier': 'FREEMIUM',
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

// Run the function
clearAndReseedStreaming()
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });
