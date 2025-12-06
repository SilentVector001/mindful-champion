require('dotenv').config({ path: '.env' });

// Import the new config
const { createS3Client, getBucketConfig } = require('./lib/aws-config.ts');
const { PutObjectCommand } = require("@aws-sdk/client-s3");

async function testNewConfig() {
  try {
    console.log('Testing new AWS config...\n');
    
    const config = getBucketConfig();
    console.log('Bucket config:', config);
    
    const client = createS3Client();
    console.log('\nS3 Client created successfully\n');
    
    // Test upload
    const testKey = `${config.folderPrefix}public/uploads/test-new-config-${Date.now()}.txt`;
    const testContent = 'Testing new credential configuration';
    
    console.log('Attempting test upload...');
    const command = new PutObjectCommand({
      Bucket: config.bucketName,
      Key: testKey,
      Body: Buffer.from(testContent),
      ContentType: 'text/plain'
    });
    
    await client.send(command);
    console.log('\n✅ Upload successful!');
    console.log('Key:', testKey);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

testNewConfig();
