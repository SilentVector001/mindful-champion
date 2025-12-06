import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log('Testing database connectivity...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test VideoAnalysis table
    const count = await prisma.videoAnalysis.count();
    console.log(`✅ VideoAnalysis table accessible - Total records: ${count}`);
    
    // Test fetching one record (if any)
    if (count > 0) {
      const sample = await prisma.videoAnalysis.findFirst({
        select: {
          id: true,
          analysisStatus: true,
          shotDetectionProgress: true,
          detectedShots: true
        }
      });
      console.log('✅ Sample record fetched successfully');
      console.log('Sample record fields:', {
        id: sample?.id,
        analysisStatus: sample?.analysisStatus,
        hasShotDetectionProgress: !!sample?.shotDetectionProgress,
        hasDetectedShots: !!sample?.detectedShots
      });
    }
    
    console.log('\n✅ All database tests passed!');
  } catch (error) {
    console.error('❌ Database error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
