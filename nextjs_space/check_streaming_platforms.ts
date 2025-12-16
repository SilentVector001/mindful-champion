import { prisma } from './lib/db';

async function checkStreamingPlatforms() {
  try {
    const platforms = await prisma.streamingPlatform.findMany({
      orderBy: { name: 'asc' }
    });
    
    console.log(`\n📊 Total Streaming Platforms: ${platforms.length}\n`);
    
    platforms.forEach((platform, index) => {
      console.log(`${index + 1}. ${platform.name}`);
      console.log(`   ID: ${platform.platformId}`);
      console.log(`   Type: ${platform.type}`);
      console.log(`   Description: ${platform.description?.substring(0, 60)}...`);
      console.log(`   Active: ${platform.isActive}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStreamingPlatforms();
