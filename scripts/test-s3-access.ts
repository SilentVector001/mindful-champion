import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function testS3Access() {
  console.log('🔍 Testing S3 Access...\n');
  
  // Check env vars
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID || process.env.ABACUS_AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || process.env.ABACUS_AWS_SECRET_ACCESS_KEY;
  const sessionToken = process.env.AWS_SESSION_TOKEN || process.env.ABACUS_AWS_SESSION_TOKEN;
  const bucketName = process.env.AWS_BUCKET_NAME;
  const region = process.env.AWS_REGION || 'us-west-2';
  const folderPrefix = process.env.AWS_FOLDER_PREFIX || '';
  
  console.log('📋 Configuration:');
  console.log('  Access Key ID:', accessKeyId ? '✅ SET' : '❌ NOT SET');
  console.log('  Secret Key:', secretAccessKey ? '✅ SET' : '❌ NOT SET');
  console.log('  Session Token:', sessionToken ? '✅ SET' : '❌ NOT SET');
  console.log('  Bucket Name:', bucketName || '❌ NOT SET');
  console.log('  Region:', region);
  console.log('  Folder Prefix:', folderPrefix || '(none)');
  console.log();
  
  if (!bucketName) {
    console.error('❌ AWS_BUCKET_NAME is not configured!');
    return;
  }
  
  if (!accessKeyId || !secretAccessKey) {
    console.error('❌ AWS credentials are not configured!');
    return;
  }
  
  // Create S3 client
  const s3Client = new S3Client({
    region: region,
    credentials: {
      accessKeyId,
      secretAccessKey,
      ...(sessionToken && { sessionToken })
    }
  });
  
  try {
    // Test 1: List objects in bucket
    console.log('📂 Test 1: Listing objects in bucket...');
    const listCommand = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: folderPrefix,
      MaxKeys: 5
    });
    
    const listResult = await s3Client.send(listCommand);
    console.log(`✅ List successful! Found ${listResult.KeyCount} objects (showing max 5)`);
    if (listResult.Contents && listResult.Contents.length > 0) {
      console.log('   Sample objects:');
      listResult.Contents.slice(0, 3).forEach(obj => {
        console.log(`   - ${obj.Key} (${obj.Size} bytes, modified: ${obj.LastModified})`);
      });
    }
    console.log();
    
    // Test 2: Upload a test file
    console.log('📤 Test 2: Uploading test file...');
    const testKey = `${folderPrefix}test-upload-${Date.now()}.txt`;
    const testContent = `Test upload at ${new Date().toISOString()}`;
    
    const putCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: testKey,
      Body: Buffer.from(testContent),
      ContentType: 'text/plain'
    });
    
    await s3Client.send(putCommand);
    console.log(`✅ Upload successful! Key: ${testKey}`);
    console.log();
    
    // Test 3: Generate signed URL
    console.log('🔗 Test 3: Generating signed URL...');
    const getCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: testKey
    });
    
    const signedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 300 });
    console.log('✅ Signed URL generated successfully!');
    console.log(`   URL: ${signedUrl.substring(0, 100)}...`);
    console.log();
    
    // Test 4: Check for recent video uploads
    console.log('📹 Test 4: Looking for recent video uploads...');
    const videoListCommand = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: `${folderPrefix}uploads/`,
      MaxKeys: 10
    });
    
    const videoListResult = await s3Client.send(videoListCommand);
    console.log(`Found ${videoListResult.KeyCount} files in uploads folder`);
    
    if (videoListResult.Contents && videoListResult.Contents.length > 0) {
      console.log('   Recent uploads:');
      videoListResult.Contents
        .sort((a, b) => (b.LastModified?.getTime() || 0) - (a.LastModified?.getTime() || 0))
        .slice(0, 5)
        .forEach(obj => {
          console.log(`   - ${obj.Key}`);
          console.log(`     Size: ${obj.Size} bytes`);
          console.log(`     Modified: ${obj.LastModified}`);
        });
    } else {
      console.log('   ⚠️ No files found in uploads folder');
    }
    console.log();
    
    console.log('✅ All S3 tests passed!');
    console.log('\n📊 Summary:');
    console.log('  ✅ S3 credentials are valid');
    console.log('  ✅ Can list objects in bucket');
    console.log('  ✅ Can upload files to bucket');
    console.log('  ✅ Can generate signed URLs');
    
  } catch (error) {
    console.error('\n❌ S3 Test Failed!');
    console.error('Error:', error);
    
    if (error instanceof Error) {
      console.error('\nError Details:');
      console.error('  Message:', error.message);
      console.error('  Name:', error.name);
      
      // Provide helpful error messages
      if (error.message.includes('credentials')) {
        console.error('\n💡 Tip: Check your AWS credentials are correct and not expired');
      } else if (error.message.includes('AccessDenied')) {
        console.error('\n💡 Tip: The AWS credentials lack permission to access this bucket');
      } else if (error.message.includes('NoSuchBucket')) {
        console.error('\n💡 Tip: The bucket name is incorrect or does not exist');
      } else if (error.message.includes('ExpiredToken')) {
        console.error('\n💡 Tip: Your AWS session token has expired. Please refresh your credentials');
      }
    }
  }
}

testS3Access();
