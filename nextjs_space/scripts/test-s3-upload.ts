import { uploadFile, getFileUrl } from '../lib/s3'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') })

async function testS3Upload() {
  console.log('=== Testing S3 Upload ===\n')
  
  console.log('Environment variables:')
  console.log('AWS_BUCKET_NAME:', process.env.AWS_BUCKET_NAME)
  console.log('AWS_REGION:', process.env.AWS_REGION)
  console.log('AWS_FOLDER_PREFIX:', process.env.AWS_FOLDER_PREFIX)
  console.log('AWS_PROFILE:', process.env.AWS_PROFILE)
  console.log('AWS_CONFIG_FILE:', process.env.AWS_CONFIG_FILE)
  console.log('')
  
  try {
    // Create a small test buffer
    const testContent = 'This is a test file for S3 upload'
    const buffer = Buffer.from(testContent, 'utf-8')
    const fileName = `test-upload-${Date.now()}.txt`
    
    console.log('Uploading test file:', fileName)
    console.log('File size:', buffer.length, 'bytes')
    console.log('')
    
    // Upload the file
    const cloudStoragePath = await uploadFile(buffer, fileName, true, 'text/plain')
    console.log('✅ Upload successful!')
    console.log('Cloud storage path:', cloudStoragePath)
    console.log('')
    
    // Get the URL
    console.log('Generating signed URL...')
    const url = await getFileUrl(cloudStoragePath, true)
    console.log('✅ URL generated successfully!')
    console.log('URL:', url.substring(0, 100) + '...')
    console.log('')
    
    console.log('=== Test passed! S3 is working correctly. ===')
  } catch (error) {
    console.error('❌ Test failed!')
    console.error('Error:', error)
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    process.exit(1)
  }
}

testS3Upload()
