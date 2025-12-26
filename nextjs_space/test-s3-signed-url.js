// Test AWS S3 Signed URL Generation
require('dotenv').config({ path: '.env.local' });
const { S3Client, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

async function testS3SignedURL() {
  console.log('\n=== Testing AWS S3 Signed URL Generation ===\n');
  
  // Check environment variables
  console.log('1. Checking Environment Variables:');
  const accessKeyId = process.env.ABACUS_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.ABACUS_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
  const sessionToken = process.env.ABACUS_AWS_SESSION_TOKEN || process.env.AWS_SESSION_TOKEN;
  const region = process.env.AWS_REGION || 'us-west-2';
  const bucketName = process.env.AWS_BUCKET_NAME;
  const folderPrefix = process.env.AWS_FOLDER_PREFIX || '';
  
  console.log(`   AWS_REGION: ${region}`);
  console.log(`   AWS_BUCKET_NAME: ${bucketName || '✗ Missing'}`);
  console.log(`   AWS_FOLDER_PREFIX: ${folderPrefix}`);
  console.log(`   Access Key ID: ${accessKeyId ? '✓ Set' : '✗ Missing'}`);
  console.log(`   Secret Access Key: ${secretAccessKey ? '✓ Set (hidden)' : '✗ Missing'}`);
  console.log(`   Session Token: ${sessionToken ? '✓ Set (temporary credentials)' : '(not using temporary credentials)'}`);
  
  if (!accessKeyId || !secretAccessKey || !bucketName) {
    console.log('\n✗ ERROR: Missing required AWS credentials or bucket!');
    return false;
  }
  
  // Initialize S3 Client
  console.log('\n2. Initializing S3 Client:');
  try {
    const s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
        ...(sessionToken && { sessionToken })
      },
    });
    console.log('   ✓ S3 Client initialized successfully');
    
    // Test generating a signed URL for a sample video path
    console.log('\n3. Testing Signed URL Generation:');
    const testVideoKey = `${folderPrefix}uploads/sample-video.mp4`;
    console.log(`   Testing with key: ${testVideoKey}`);
    
    try {
      const command = new HeadObjectCommand({
        Bucket: bucketName,
        Key: testVideoKey,
      });
      
      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      console.log('   ✓ Signed URL generated successfully!');
      console.log(`   URL length: ${signedUrl.length} characters`);
      console.log(`   URL starts with: ${signedUrl.substring(0, 50)}...`);
      
      console.log('\n=== AWS S3 Configuration: SUCCESS ===\n');
      console.log('✓ AWS credentials are loaded');
      console.log('✓ S3 client can be initialized');
      console.log('✓ Signed URLs can be generated');
      return true;
    } catch (error) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        console.log(`   ⚠ Note: Test video not found (this is expected)`);
        console.log('   ✓ But signed URL generation works!');
        console.log('\n=== AWS S3 Configuration: SUCCESS ===\n');
        return true;
      }
      throw error;
    }
  } catch (error) {
    console.log(`   ✗ ERROR: ${error.message}`);
    if (error.Code) console.log(`   Error Code: ${error.Code}`);
    console.log('\n=== AWS S3 Configuration: FAILED ===\n');
    return false;
  }
}

testS3SignedURL().then(success => {
  process.exit(success ? 0 : 1);
}).catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
