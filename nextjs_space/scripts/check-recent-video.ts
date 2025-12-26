import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const prisma = new PrismaClient();

async function checkRecentVideo() {
  try {
    // Get the most recent video analysis (uploaded in last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const recentVideo = await prisma.videoAnalysis.findFirst({
      where: {
        uploadedAt: {
          gte: oneHourAgo
        }
      },
      orderBy: {
        uploadedAt: 'desc'
      },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!recentVideo) {
      console.log('❌ No videos uploaded in the last hour');
      
      // Get the most recent video regardless of time
      const latestVideo = await prisma.videoAnalysis.findFirst({
        orderBy: {
          uploadedAt: 'desc'
        },
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });
      
      if (latestVideo) {
        console.log('\n📹 Most Recent Video (regardless of time):');
        console.log('ID:', latestVideo.id);
        console.log('User:', latestVideo.user.email);
        console.log('Uploaded At:', latestVideo.uploadedAt);
        console.log('\n🔗 Storage:');
        console.log('Video URL:', latestVideo.videoUrl || 'NULL');
        console.log('Cloud Storage Path:', latestVideo.cloud_storage_path || 'NULL');
        console.log('\n📊 Status:');
        console.log('Analysis Status:', latestVideo.analysisStatus);
        console.log('\n📁 File Info:');
        console.log('File Name:', latestVideo.fileName);
        console.log('File Size:', latestVideo.fileSize, 'bytes');
        console.log('Duration:', latestVideo.duration, 'seconds');
        console.log('Is Public:', latestVideo.isPublic);
      }
      await prisma.$disconnect();
      return;
    }

    console.log('✅ Found recent video uploaded in last hour!');
    console.log('\n📹 Video Details:');
    console.log('ID:', recentVideo.id);
    console.log('User:', recentVideo.user.email);
    console.log('Uploaded At:', recentVideo.uploadedAt);
    console.log('\n🔗 Storage:');
    console.log('Video URL:', recentVideo.videoUrl || 'NULL');
    console.log('Cloud Storage Path:', recentVideo.cloud_storage_path || 'NULL');
    console.log('\n📊 Status:');
    console.log('Analysis Status:', recentVideo.analysisStatus);
    console.log('\n📁 File Info:');
    console.log('File Name:', recentVideo.fileName);
    console.log('File Size:', recentVideo.fileSize, 'bytes');
    console.log('Duration:', recentVideo.duration, 'seconds');
    console.log('Is Public:', recentVideo.isPublic);
    
  } catch (error) {
    console.error('Error checking video:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRecentVideo();
