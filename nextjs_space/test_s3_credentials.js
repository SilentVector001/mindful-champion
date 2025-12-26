const { S3Client, ListBucketsCommand } = require("@aws-sdk/client-s3");
const { fromNodeProviderChain } = require("@aws-sdk/credential-providers");

async function testCredentials() {
  try {
    console.log('Testing S3 credentials...');
    console.log('AWS_PROFILE:', process.env.AWS_PROFILE);
    console.log('AWS_CONFIG_FILE:', process.env.AWS_CONFIG_FILE);
    console.log('AWS_REGION:', process.env.AWS_REGION);
    console.log('AWS_BUCKET_NAME:', process.env.AWS_BUCKET_NAME);
    
    const client = new S3Client({
      region: process.env.AWS_REGION || 'us-west-2',
      credentials: fromNodeProviderChain({
        profile: process.env.AWS_PROFILE,
        filepath: process.env.AWS_CONFIG_FILE
      })
    });
    
    // Try to resolve credentials
    const creds = await client.config.credentials();
    console.log('\n✅ Credentials resolved successfully:');
    console.log('- Access Key ID:', creds.accessKeyId?.substring(0, 20) + '...');
    console.log('- Has Secret Key:', !!creds.secretAccessKey);
    console.log('- Has Session Token:', !!creds.sessionToken);
    if (creds.expiration) {
      console.log('- Expiration:', creds.expiration);
      const now = new Date();
      const expiresIn = (creds.expiration.getTime() - now.getTime()) / 1000 / 60;
      console.log('- Expires in:', Math.round(expiresIn), 'minutes');
    }
    
    // Try to list buckets (minimal permission test)
    console.log('\n🔍 Testing S3 access...');
    const command = new ListBucketsCommand({});
    const response = await client.send(command);
    console.log('✅ S3 access confirmed. Buckets accessible:', response.Buckets?.length || 0);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
}

testCredentials();
