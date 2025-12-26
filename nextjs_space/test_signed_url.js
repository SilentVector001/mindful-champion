const { getFileUrl } = require('./dist/lib/s3.js');

async function test() {
  try {
    const cloud_storage_path = '6482/uploads/1764514025267-CD13B324-9947-46FB-A233-6FD2F71239BD.mov';
    const isPublic = true;
    
    console.log('\n=== Testing Signed URL Generation ===');
    console.log(`Cloud Storage Path: ${cloud_storage_path}`);
    console.log(`Is Public: ${isPublic}\n`);
    
    const signedUrl = await getFileUrl(cloud_storage_path, isPublic);
    
    console.log('✅ Signed URL generated successfully!');
    console.log(`URL: ${signedUrl.substring(0, 100)}...`);
    console.log(`Full URL length: ${signedUrl.length} characters`);
    
    // Test if the URL is accessible
    const https = require('https');
    const url = new URL(signedUrl);
    
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'HEAD'
    };
    
    console.log('\n=== Testing URL Accessibility ===');
    
    const req = https.request(options, (res) => {
      console.log(`Status: ${res.statusCode}`);
      console.log(`Content-Type: ${res.headers['content-type']}`);
      console.log(`Content-Length: ${res.headers['content-length']}`);
      
      if (res.statusCode === 200) {
        console.log('\n✅ VIDEO URL IS WORKING!');
      } else {
        console.log('\n❌ Video URL returned non-200 status');
      }
    });
    
    req.on('error', (error) => {
      console.error('❌ Error testing URL:', error.message);
    });
    
    req.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

test();
