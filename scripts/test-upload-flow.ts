import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const prisma = new PrismaClient();

async function testUploadFlow() {
  console.log('🧪 Testing Upload Flow (Database Creation)...\n');
  
  try {
    // Try to create a test video record
    console.log('📝 Attempting to create test video record...');
    
    const testVideo = await prisma.videoAnalysis.create({
      data: {
        userId: 'test-user-id',
        videoUrl: '6482/uploads/test-video.mp4',
        cloud_storage_path: '6482/uploads/test-video.mp4',
        isPublic: false,
        fileName: 'test-video.mp4',
        fileSize: 1024,
        duration: 10,
        title: 'Test Video',
        analysisStatus: 'PENDING'
      }
    });
    
    console.log('✅ Successfully created video record!');
    console.log('   ID:', testVideo.id);
    console.log('   User ID:', testVideo.userId);
    console.log('   Cloud Path:', testVideo.cloud_storage_path);
    console.log('   Status:', testVideo.analysisStatus);
    console.log();
    
    // Now try to delete it
    console.log('🗑️  Cleaning up test record...');
    await prisma.videoAnalysis.delete({
      where: {
        id: testVideo.id
      }
    });
    console.log('✅ Test record deleted\n');
    
    console.log('✅ Database creation works! The issue might be:');
    console.log('   1. Invalid userId in upload API');
    console.log('   2. Upload API is catching and suppressing the error');
    console.log('   3. Upload API is not being called at all');
    
  } catch (error) {
    console.error('❌ Failed to create video record!');
    console.error('Error:', error);
    
    if (error instanceof Error) {
      console.error('\n📋 Error Details:');
      console.error('   Message:', error.message);
      console.error('   Name:', error.name);
      
      // Prisma-specific errors
      if (error.message.includes('Foreign key constraint')) {
        console.error('\n💡 ISSUE: Foreign key constraint failed');
        console.error('   The userId does not exist in the User table');
        console.error('   This is likely why uploads are failing!');
      } else if (error.message.includes('Unique constraint')) {
        console.error('\n💡 ISSUE: Unique constraint failed');
        console.error('   A record with this value already exists');
      } else if (error.message.includes('required')) {
        console.error('\n💡 ISSUE: Required field missing');
        console.error('   One or more required fields are not provided');
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

testUploadFlow();
