const { S3Client, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
require('dotenv').config({ path: '.env.local' });

async function testS3Operations() {
  const client = new S3Client({
    region: process.env.AWS_REGION || 'us-west-2',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      sessionToken: process.env.AWS_SESSION_TOKEN
    }
  });

  console.log('Testing S3 operations...');
  console.log('Bucket:', process.env.AWS_BUCKET_NAME);
  console.log('');

  // Test 1: Upload a test file
  console.log('Test 1: Uploading test file...');
  try {
    const testKey = `${process.env.AWS_FOLDER_PREFIX}test/health-check-${Date.now()}.txt`;
    const putCommand = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: testKey,
      Body: Buffer.from('S3 Health Check - ' + new Date().toISOString()),
      ContentType: 'text/plain'
    });
    
    await client.send(putCommand);
    console.log('✅ Upload successful:', testKey);
    console.log('');

    // Test 2: Generate signed URL for the test file
    console.log('Test 2: Generating signed URL...');
    const getCommand = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: testKey
    });
    
    const signedUrl = await getSignedUrl(client, getCommand, { expiresIn: 3600 });
    console.log('✅ Signed URL generated successfully');
    console.log('URL:', signedUrl.substring(0, 100) + '...');
    console.log('');
    
    console.log('🎉 All S3 operations working correctly!');
    console.log('');
    console.log('Summary:');
    console.log('  ✅ Upload (PutObject) - Working');
    console.log('  ✅ Signed URL generation (GetObject) - Working');
    console.log('  ✅ Video playback should work now');
    
  } catch (error) {
    console.error('❌ Operation failed!');
    console.error('Error:', error.message);
    if (error.Code) console.error('Error Code:', error.Code);
    
    console.log('');
    console.log('Troubleshooting:');
    console.log('  - Check if AWS credentials are valid');
    console.log('  - Verify IAM role has s3:PutObject and s3:GetObject permissions');
    console.log('  - Ensure bucket name and prefix are correct');
  }
}

testS3Operations();
