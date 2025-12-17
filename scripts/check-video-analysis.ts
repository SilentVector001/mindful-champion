import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const prisma = new PrismaClient();

async function checkVideoAnalysis() {
  try {
    console.log('🔍 Investigating Video Analysis Records...\n');
    
    // Check specific analysis IDs
    const analysisIds = ['cmikrn5oa000r1080fsm20mu', 'cmikvanik000dib09s62kb2x'];
    
    console.log('📋 Checking specific analysis records:');
    console.log('=====================================\n');
    
    for (const id of analysisIds) {
      const analysis = await prisma.videoAnalysis.findUnique({
        where: { id },
        select: {
          id: true,
          videoUrl: true,
          cloud_storage_path: true,
          isPublic: true,
          analysisStatus: true,
          uploadedAt: true,
          fileName: true,
          fileSize: true,
          shotDetectionProgress: true,
          detectedShots: true,
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
            }
          }
        }
      });
      
      if (analysis) {
        console.log(`✅ Found analysis: ${id}`);
        console.log(`   User: ${analysis.user?.email || 'Unknown'}`);
        console.log(`   videoUrl: ${analysis.videoUrl || 'NULL'}`);
        console.log(`   cloud_storage_path: ${analysis.cloud_storage_path || 'NULL'}`);
        console.log(`   isPublic: ${analysis.isPublic}`);
        console.log(`   analysisStatus: ${analysis.analysisStatus}`);
        console.log(`   fileName: ${analysis.fileName || 'NULL'}`);
        console.log(`   fileSize: ${analysis.fileSize || 'NULL'}`);
        console.log(`   shotDetectionProgress: ${JSON.stringify(analysis.shotDetectionProgress)}`);
        console.log(`   detectedShots: ${analysis.detectedShots ? JSON.stringify(analysis.detectedShots).substring(0, 100) + '...' : 'NULL'}`);
        console.log(`   uploadedAt: ${analysis.uploadedAt}\n`);
      } else {
        console.log(`❌ Analysis ${id} not found in database\n`);
      }
    }
    
    // Check recent uploads
    console.log('\n📊 Checking recent VideoAnalysis records (last 10):');
    console.log('==================================================\n');
    
    const recentAnalyses = await prisma.videoAnalysis.findMany({
      take: 10,
      orderBy: { uploadedAt: 'desc' },
      select: {
        id: true,
        videoUrl: true,
        cloud_storage_path: true,
        isPublic: true,
        analysisStatus: true,
        uploadedAt: true,
        shotDetectionProgress: true,
        user: {
          select: {
            email: true,
          }
        }
      }
    });
    
    console.log(`Found ${recentAnalyses.length} recent analyses:\n`);
    
    for (const analysis of recentAnalyses) {
      const hasLocalUrl = analysis.videoUrl && !analysis.videoUrl.startsWith('http');
      const hasS3Path = !!analysis.cloud_storage_path;
      const hasS3Url = analysis.videoUrl && analysis.videoUrl.includes('amazonaws.com');
      
      console.log(`ID: ${analysis.id.substring(0, 20)}...`);
      console.log(`  User: ${analysis.user?.email || 'Unknown'}`);
      console.log(`  Status: ${analysis.analysisStatus}`);
      console.log(`  Uploaded: ${analysis.uploadedAt}`);
      console.log(`  Storage type: ${hasS3Path ? '☁️  S3' : hasLocalUrl ? '💾 Local' : hasS3Url ? '☁️  S3 URL' : '❓ Unknown'}`);
      console.log(`  videoUrl: ${analysis.videoUrl?.substring(0, 50) || 'NULL'}...`);
      console.log(`  cloud_storage_path: ${analysis.cloud_storage_path || 'NULL'}`);
      console.log(`  shotDetectionProgress: ${analysis.shotDetectionProgress ? 'Has progress data' : 'No progress data'}`);
      console.log('');
    }
    
    // Statistics
    console.log('\n📈 Statistics:');
    console.log('===============\n');
    
    const total = await prisma.videoAnalysis.count();
    const withS3Path = await prisma.videoAnalysis.count({
      where: { 
        cloud_storage_path: { 
          not: null
        } 
      }
    });
    const withLocalPath = await prisma.videoAnalysis.count({
      where: {
        cloud_storage_path: null
      }
    });
    const withShotDetection = await prisma.videoAnalysis.count({
      where: { 
        detectedShots: { 
          not: null
        } 
      }
    });
    
    console.log(`Total video analyses: ${total}`);
    console.log(`With S3 storage path: ${withS3Path} (${((withS3Path/total)*100).toFixed(1)}%)`);
    console.log(`With local path only: ${withLocalPath} (${((withLocalPath/total)*100).toFixed(1)}%)`);
    console.log(`With shot detection data: ${withShotDetection} (${((withShotDetection/total)*100).toFixed(1)}%)`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVideoAnalysis();
