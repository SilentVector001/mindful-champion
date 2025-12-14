#!/usr/bin/env node

/**
 * Test script to verify S3 upload configuration
 * This script checks AWS credentials and S3 bucket access
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
config({ path: join(__dirname, '..', '.env') });

console.log('\n🔍 Testing S3 Upload Configuration...\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log('  AWS_BUCKET_NAME:', process.env.AWS_BUCKET_NAME || 'NOT SET');
console.log('  AWS_FOLDER_PREFIX:', process.env.AWS_FOLDER_PREFIX || 'NOT SET');
console.log('  AWS_REGION:', process.env.AWS_REGION || 'NOT SET');
console.log('  AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '✓ Set' : 'NOT SET');
console.log('  AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '✓ Set' : 'NOT SET');
console.log('  AWS_SESSION_TOKEN:', process.env.AWS_SESSION_TOKEN ? '✓ Set' : 'NOT SET');
console.log('  ABACUS_AWS_ACCESS_KEY_ID:', process.env.ABACUS_AWS_ACCESS_KEY_ID ? '✓ Set' : 'NOT SET');
console.log('  ABACUS_AWS_SECRET_ACCESS_KEY:', process.env.ABACUS_AWS_SECRET_ACCESS_KEY ? '✓ Set' : 'NOT SET');
console.log('  ABACUS_AWS_SESSION_TOKEN:', process.env.ABACUS_AWS_SESSION_TOKEN ? '✓ Set' : 'NOT SET');

const bucketName = process.env.AWS_BUCKET_NAME;
const folderPrefix = process.env.AWS_FOLDER_PREFIX || '';
const region = process.env.AWS_REGION || 'us-west-2';

if (!bucketName) {
  console.error('\n❌ Error: AWS_BUCKET_NAME is not set in .env file');
  process.exit(1);
}

// Create S3 client with fallback credentials
const accessKeyId = process.env.AWS_ACCESS_KEY_ID || process.env.ABACUS_AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || process.env.ABACUS_AWS_SECRET_ACCESS_KEY;
const sessionToken = process.env.AWS_SESSION_TOKEN || process.env.ABACUS_AWS_SESSION_TOKEN;

console.log('\n🔐 Credentials Configuration:');
console.log('  Using credentials:', accessKeyId ? (accessKeyId === process.env.AWS_ACCESS_KEY_ID ? 'AWS_*' : 'ABACUS_AWS_*') : 'Default chain');
console.log('  Access Key ID:', accessKeyId ? accessKeyId.substring(0, 10) + '...' : 'NOT AVAILABLE');
console.log('  Has Secret Key:', !!secretAccessKey);
console.log('  Has Session Token:', !!sessionToken);

const clientConfig = {
  region
};

if (accessKeyId && secretAccessKey) {
  clientConfig.credentials = {
    accessKeyId,
    secretAccessKey,
    ...(sessionToken && { sessionToken })
  };
}

const client = new S3Client(clientConfig);

// Test upload
const testFileName = `test-${Date.now()}.txt`;
const testKey = `${folderPrefix}public/uploads/${testFileName}`;
const testContent = 'This is a test upload from the S3 configuration test script.';

console.log('\n📤 Testing S3 Upload...');
console.log('  Bucket:', bucketName);
console.log('  Key:', testKey);
console.log('  Region:', region);

try {
  // Upload test file
  const uploadCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: testKey,
    Body: Buffer.from(testContent),
    ContentType: 'text/plain'
  });

  console.log('  Uploading test file...');
  await client.send(uploadCommand);
  console.log('  ✅ Upload successful!');

  // Generate signed URL
  console.log('\n🔗 Generating Signed URL...');
  const getCommand = new GetObjectCommand({
    Bucket: bucketName,
    Key: testKey
  });

  const signedUrl = await getSignedUrl(client, getCommand, { expiresIn: 3600 });
  console.log('  ✅ Signed URL generated successfully!');
  console.log('  URL:', signedUrl.substring(0, 100) + '...');

  // Clean up - delete test file
  console.log('\n🗑️  Cleaning up...');
  const deleteCommand = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: testKey
  });

  await client.send(deleteCommand);
  console.log('  ✅ Test file deleted successfully!');

  console.log('\n✅ All S3 tests passed! Your S3 configuration is working correctly.');
  console.log('\n📝 Summary:');
  console.log('  ✓ AWS credentials are valid');
  console.log('  ✓ S3 bucket is accessible');
  console.log('  ✓ Upload permissions are working');
  console.log('  ✓ Signed URL generation is working');
  
  process.exit(0);
} catch (error) {
  console.error('\n❌ S3 Test Failed!');
  console.error('\nError Details:');
  console.error('  Name:', error.name);
  console.error('  Message:', error.message);
  
  if (error.name === 'CredentialsError' || error.message.includes('credentials')) {
    console.error('\n💡 Possible Solutions:');
    console.error('  1. Check that AWS credentials are set correctly in environment');
    console.error('  2. Verify ABACUS_AWS_* credentials are not expired');
    console.error('  3. Check that credentials have S3 access permissions');
  } else if (error.name === 'NoSuchBucket') {
    console.error('\n💡 Possible Solutions:');
    console.error('  1. Verify the bucket name in .env file is correct');
    console.error('  2. Check that the bucket exists in the specified region');
    console.error('  3. Verify you have access to the bucket');
  } else if (error.name === 'AccessDenied') {
    console.error('\n💡 Possible Solutions:');
    console.error('  1. Check IAM permissions for the AWS credentials');
    console.error('  2. Verify bucket policy allows uploads');
    console.error('  3. Check if MFA or additional security is required');
  }
  
  console.error('\nFull error:', error);
  process.exit(1);
}
