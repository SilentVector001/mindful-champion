// Test the upload API endpoint with proper environment loading
require('dotenv').config({ path: '.env' });

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { fromNodeProviderChain } = require("@aws-sdk/credential-providers");

async function testUpload() {
  try {
    console.log('Environment variables:');
    console.log('- AWS_PROFILE:', process.env.AWS_PROFILE);
    console.log('- AWS_CONFIG_FILE:', process.env.AWS_CONFIG_FILE);
    console.log('- AWS_REGION:', process.env.AWS_REGION);
    console.log('- AWS_BUCKET_NAME:', process.env.AWS_BUCKET_NAME);
    console.log('- AWS_FOLDER_PREFIX:', process.env.AWS_FOLDER_PREFIX);
    
    const bucketName = process.env.AWS_BUCKET_NAME;
    const region = process.env.AWS_REGION || 'us-west-2';
    const folderPrefix = process.env.AWS_FOLDER_PREFIX || '';
    
    if (!bucketName) {
      throw new Error('AWS_BUCKET_NAME not set');
    }
    
    const client = new S3Client({
      region,
      credentials: fromNodeProviderChain({
        profile: process.env.AWS_PROFILE,
        filepath: process.env.AWS_CONFIG_FILE
      })
    });
    
    // Resolve credentials
    const creds = await client.config.credentials();
    console.log('\n✅ Credentials resolved:');
    console.log('- Access Key:', creds.accessKeyId?.substring(0, 20) + '...');
    console.log('- Has Secret:', !!creds.secretAccessKey);
    console.log('- Has Token:', !!creds.sessionToken);
    
    // Test upload
    console.log('\n📤 Testing upload to S3...');
    const testKey = `${folderPrefix}public/uploads/test-${Date.now()}.txt`;
    const testContent = 'This is a test upload from debugging script';
    
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: testKey,
      Body: Buffer.from(testContent),
      ContentType: 'text/plain'
    });
    
    await client.send(command);
    console.log('✅ Upload successful!');
    console.log('- Bucket:', bucketName);
    console.log('- Key:', testKey);
    
  } catch (error) {
    console.error('\n❌ Upload failed:', error.message);
    if (error.$metadata) {
      console.error('- HTTP Status:', error.$metadata.httpStatusCode);
      console.error('- Request ID:', error.$metadata.requestId);
    }
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

testUpload();
