import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const prisma = new PrismaClient();

async function checkDbS3Match() {
  console.log('🔍 Checking Database-S3 Match...\n');
  
  // S3 files we found
  const s3Files = [
    '6482/uploads/1764506058385-IMG_4404.mov',
    '6482/uploads/1764500917308-CD13B324-9947-46FB-A233-6FD2F71239BD.mov',
    '6482/uploads/1764495957631-CD13B324-9947-46FB-A233-6FD2F71239BD.mov',
    '6482/uploads/1764463260393-IMG_4404__3_.mov',
    '6482/uploads/1764463013262-IMG_4404__3_.mov'
  ];
  
  try {
    // Get total video count
    const totalCount = await prisma.videoAnalysis.count();
    console.log(`📊 Total videos in database: ${totalCount}\n`);
    
    // Check each S3 file
    console.log('🔎 Checking if S3 files have database records:\n');
    for (const s3Key of s3Files) {
      const record = await prisma.videoAnalysis.findFirst({
        where: {
          cloud_storage_path: s3Key
        },
        select: {
          id: true,
          uploadedAt: true,
          analysisStatus: true,
          fileName: true,
          user: {
            select: {
              email: true
            }
          }
        }
      });
      
      if (record) {
        console.log(`✅ ${s3Key}`);
        console.log(`   ID: ${record.id}`);
        console.log(`   User: ${record.user.email}`);
        console.log(`   Uploaded: ${record.uploadedAt}`);
        console.log(`   Status: ${record.analysisStatus}`);
      } else {
        console.log(`❌ ${s3Key}`);
        console.log(`   No database record found!`);
      }
      console.log();
    }
    
    // Get most recent 5 videos from database
    console.log('📹 Most Recent 5 Videos in Database:\n');
    const recentVideos = await prisma.videoAnalysis.findMany({
      orderBy: {
        uploadedAt: 'desc'
      },
      take: 5,
      select: {
        id: true,
        uploadedAt: true,
        cloud_storage_path: true,
        analysisStatus: true,
        fileName: true,
        user: {
          select: {
            email: true
          }
        }
      }
    });
    
    if (recentVideos.length === 0) {
      console.log('❌ No videos found in database!\n');
    } else {
      recentVideos.forEach((video, i) => {
        console.log(`${i + 1}. Video ID: ${video.id}`);
        console.log(`   User: ${video.user.email}`);
        console.log(`   Uploaded: ${video.uploadedAt}`);
        console.log(`   File: ${video.fileName}`);
        console.log(`   S3 Path: ${video.cloud_storage_path || 'NULL'}`);
        console.log(`   Status: ${video.analysisStatus}`);
        console.log();
      });
    }
    
    // Check for orphaned S3 files
    console.log('🔍 Diagnosis:\n');
    const orphanCount = s3Files.length - recentVideos.length;
    if (orphanCount > 0) {
      console.log(`⚠️ Found ${orphanCount} S3 files without database records`);
      console.log('   This suggests uploads are reaching S3 but database records are not being created.');
      console.log('   Possible causes:');
      console.log('   - Transaction failure after S3 upload');
      console.log('   - Database connection issues');
      console.log('   - Error in the Prisma create operation\n');
    }
    
    if (recentVideos.some(v => !v.cloud_storage_path)) {
      console.log('⚠️ Some database records are missing cloud_storage_path');
      console.log('   This will cause videos to fail loading\n');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDbS3Match();
