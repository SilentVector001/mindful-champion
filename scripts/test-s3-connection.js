#!/usr/bin/env node

const { S3Client, PutObjectCommand, HeadBucketCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

console.log('\n🧪 Testing AWS S3 Connection...\n');
console.log('=====================================\n');

// Check if credentials are set
const missingVars = [];
if (!process.env.AWS_REGION) missingVars.push('AWS_REGION');
if (!process.env.AWS_BUCKET_NAME) missingVars.push('AWS_BUCKET_NAME');

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(v => console.error(`   - ${v}`));
  console.error('\nPlease check your .env file\n');
  process.exit(1);
}

const AWS_REGION = process.env.AWS_REGION;
const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const AWS_FOLDER_PREFIX = process.env.AWS_FOLDER_PREFIX || '';

console.log('Configuration:');
console.log(`   Region: ${AWS_REGION}`);
console.log(`   Bucket: ${AWS_BUCKET_NAME}`);
console.log(`   Prefix: ${AWS_FOLDER_PREFIX}`);
console.log();

// Create S3 client
const s3Client = new S3Client({
  region: AWS_REGION,
});

async function testS3Connection() {
  try {
    // Test 1: Check bucket access
    console.log('🔹 Step 1: Checking bucket access...');
    const headCommand = new HeadBucketCommand({
      Bucket: AWS_BUCKET_NAME,
    });
    await s3Client.send(headCommand);
    console.log('   ✅ Bucket is accessible\n');

    // Test 2: Upload a test file
    console.log('🔹 Step 2: Uploading test file...');
    const testContent = `S3 Connection Test\nTimestamp: ${new Date().toISOString()}\nBucket: ${AWS_BUCKET_NAME}\nRegion: ${AWS_REGION}`;
    const testKey = `${AWS_FOLDER_PREFIX}test-files/connection-test-${Date.now()}.txt`;
    
    const putCommand = new PutObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      Key: testKey,
      Body: Buffer.from(testContent),
      ContentType: 'text/plain',
    });
    
    await s3Client.send(putCommand);
    console.log(`   ✅ Test file uploaded successfully`);
    console.log(`   Location: s3://${AWS_BUCKET_NAME}/${testKey}\n`);

    // Success!
    console.log('=====================================');
    console.log('\n🎉 AWS S3 Connection Test: PASSED\n');
    console.log('✅ Your S3 credentials are working correctly!');
    console.log('✅ Video uploads will work in production\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ AWS S3 Connection Test: FAILED\n');
    console.error('Error details:');
    console.error(`   Code: ${error.name}`);
    console.error(`   Message: ${error.message}`);
    console.error();
    
    if (error.name === 'NoSuchBucket') {
      console.error('💡 Troubleshooting:');
      console.error('   - Check that the bucket name is correct');
      console.error('   - Verify the bucket exists in the AWS Console');
      console.error(`   - Current bucket: ${AWS_BUCKET_NAME}`);
    } else if (error.name === 'AccessDenied') {
      console.error('💡 Troubleshooting:');
      console.error('   - Check that your AWS credentials have S3 permissions');
      console.error('   - Verify IAM user has AmazonS3FullAccess policy');
      console.error('   - Make sure credentials are not expired');
    } else if (error.name === 'CredentialsProviderError') {
      console.error('💡 Troubleshooting:');
      console.error('   - Check that AWS_ACCESS_KEY_ID is set');
      console.error('   - Check that AWS_SECRET_ACCESS_KEY is set');
      console.error('   - Verify credentials are correct');
    }
    
    console.error();
    process.exit(1);
  }
}

testS3Connection();
