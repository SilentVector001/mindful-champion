const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");
require('dotenv').config({ path: '.env.local' });

async function testS3() {
  const client = new S3Client({
    region: process.env.AWS_REGION || 'us-west-2',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      sessionToken: process.env.AWS_SESSION_TOKEN
    }
  });

  console.log('Testing S3 connection...');
  console.log('Bucket:', process.env.AWS_BUCKET_NAME);
  console.log('Region:', process.env.AWS_REGION);
  console.log('Prefix:', process.env.AWS_FOLDER_PREFIX);

  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_BUCKET_NAME,
      Prefix: process.env.AWS_FOLDER_PREFIX,
      MaxKeys: 5
    });
    
    const response = await client.send(command);
    console.log('\n✅ S3 Connection successful!');
    console.log('Found', response.Contents?.length || 0, 'objects');
    
    if (response.Contents && response.Contents.length > 0) {
      console.log('\nFirst few objects:');
      response.Contents.forEach((obj, i) => {
        console.log(`  ${i+1}. ${obj.Key} (${obj.Size} bytes)`);
      });
    }
  } catch (error) {
    console.error('\n❌ S3 Connection failed!');
    console.error('Error:', error.message);
    if (error.Code) console.error('Error Code:', error.Code);
  }
}

testS3();
