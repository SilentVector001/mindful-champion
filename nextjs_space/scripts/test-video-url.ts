import { getFileUrl } from '../lib/s3'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function testVideoUrl() {
  const testVideoPath = '6482/uploads/1764500917308-CD13B324-9947-46FB-A233-6FD2F71239BD.mov'
  
  console.log('\n🎥 Testing Video URL Generation')
  console.log('='.repeat(80))
  console.log(`\nVideo Path: ${testVideoPath}`)
  console.log('Is Public: false (will generate signed URL)\n')
  
  try {
    const url = await getFileUrl(testVideoPath, false)
    console.log('✅ Successfully generated signed URL!')
    console.log(`\n🔗 URL (first 100 chars): ${url.substring(0, 100)}...`)
    console.log(`\n📏 Total URL length: ${url.length} characters`)
    console.log(`⏱️  URL expires in: 1 hour`)
    
    // Verify URL structure
    if (url.includes('X-Amz-Algorithm') && url.includes('X-Amz-Signature')) {
      console.log('\n✅ URL contains valid AWS signature parameters')
    }
    
  } catch (error: any) {
    console.log(`\n❌ Failed to generate URL: ${error.message}`)
    console.log('\nError details:', error)
  }
  
  console.log('\n' + '='.repeat(80) + '\n')
}

testVideoUrl()
