const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { execSync } = require('child_process');
const fs = require('fs');

async function testPreSignedURL() {
  try {
    console.log('=== Testing Pre-Signed URL Generation ===\n');
    
    // 1. Check environment variables
    const bucketName = process.env.AWS_BUCKET_NAME;
    const region = process.env.AWS_REGION || 'us-west-2';
    const profile = process.env.AWS_PROFILE;
    const configFile = process.env.AWS_CONFIG_FILE;
    
    console.log('Environment Configuration:');
    console.log('- Bucket:', bucketName);
    console.log('- Region:', region);
    console.log('- Profile:', profile);
    console.log('- Config File:', configFile);
    console.log();
    
    if (!bucketName) {
      console.error('❌ AWS_BUCKET_NAME not configured!');
      process.exit(1);
    }
    
    // 2. Get credentials from credential_process
    console.log('Fetching credentials from credential_process...');
    
    const configContent = fs.readFileSync(configFile, 'utf-8');
    const profileMatch = configContent.match(new RegExp(`\\[${profile}\\][\\s\\S]*?credential_process\\s*=\\s*(.+?)(?:\\n|$)`));
    
    if (!profileMatch) {
      console.error('❌ No credential_process found for profile:', profile);
      process.exit(1);
    }
    
    const credentialCommand = profileMatch[1].trim();
    console.log('- Command:', credentialCommand);
    
    const output = execSync(credentialCommand, { encoding: 'utf-8' });
    const credentials = JSON.parse(output);
    
    console.log('✅ Credentials fetched successfully');
    console.log('- Has AccessKeyId:', !!credentials.AccessKeyId);
    console.log('- Has SecretAccessKey:', !!credentials.SecretAccessKey);
    console.log('- Has SessionToken:', !!credentials.SessionToken);
    console.log();
    
    // 3. Create S3 client
    console.log('Creating S3 client...');
    const s3Client = new S3Client({
      region: region,
      credentials: {
        accessKeyId: credentials.AccessKeyId,
        secretAccessKey: credentials.SecretAccessKey,
        sessionToken: credentials.SessionToken
      }
    });
    console.log('✅ S3 client created\n');
    
    // 4. Generate pre-signed URL
    console.log('Generating pre-signed URL...');
    const testKey = 'test-upload-' + Date.now() + '.mp4';
    const key = `6482/public/uploads/${testKey}`;
    
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: 'video/mp4',
      Metadata: {
        'uploaded-by': 'test',
        'original-filename': 'test.mp4'
      }
    });
    
    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600
    });
    
    console.log('✅ Pre-signed URL generated successfully!\n');
    console.log('URL:', uploadUrl.substring(0, 100) + '...\n');
    
    console.log('=== TEST PASSED ===');
    console.log('Pre-signed URL generation is working correctly.');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testPreSignedURL();
