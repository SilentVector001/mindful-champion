/**
 * Test video upload flow step by step to identify where it fails
 */

import { PrismaClient } from '@prisma/client'
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { execSync } from 'child_process'

const prisma = new PrismaClient()

interface Credentials {
  AccessKeyId: string
  SecretAccessKey: string
  SessionToken?: string
  Expiration?: string
}

async function getAWSCredentials(): Promise<Credentials> {
  console.log('\n🔐 Step 1: Getting AWS Credentials...')
  
  // Try credential_process first
  try {
    const awsConfigFile = process.env.AWS_CONFIG_FILE || '/opt/hostedapp/configs_credentials/credential'
    const awsProfile = process.env.AWS_PROFILE || 'hosted_storage'
    
    const fs = require('fs')
    if (fs.existsSync(awsConfigFile)) {
      const configContent = fs.readFileSync(awsConfigFile, 'utf-8')
      const profileMatch = configContent.match(new RegExp(`\\[${awsProfile}\\][\\s\\S]*?credential_process\\s*=\\s*(.+?)(?:\\n|$)`))
      
      if (profileMatch) {
        const credentialCommand = profileMatch[1].trim()
        console.log(`   Running credential_process: ${credentialCommand}`)
        const output = execSync(credentialCommand, { encoding: 'utf-8' })
        const credentials: Credentials = JSON.parse(output)
        
        console.log('   ✅ Credentials obtained successfully')
        console.log(`   Access Key: ${credentials.AccessKeyId.substring(0, 10)}...`)
        console.log(`   Has Secret: ${!!credentials.SecretAccessKey}`)
        console.log(`   Has Session Token: ${!!credentials.SessionToken}`)
        console.log(`   Expiration: ${credentials.Expiration}`)
        
        // Check if expired
        if (credentials.Expiration) {
          const expDate = new Date(credentials.Expiration)
          const now = new Date()
          if (expDate < now) {
            console.log('   ⚠️ WARNING: Credentials are EXPIRED!')
          } else {
            const diffMs = expDate.getTime() - now.getTime()
            const diffMins = Math.floor(diffMs / 60000)
            console.log(`   Valid for: ${diffMins} minutes`)
          }
        }
        
        return credentials
      }
    }
    throw new Error('Config file not found or profile not found')
  } catch (error) {
    console.error('   ❌ Failed to get credentials:', error)
    throw error
  }
}

async function testS3Connection(credentials: Credentials) {
  console.log('\n🪣 Step 2: Testing S3 Connection...')
  
  const bucketName = process.env.AWS_BUCKET_NAME || 'abacusai-apps-c23443d20cd3d54c25905c2c-us-west-2'
  const region = process.env.AWS_REGION || 'us-west-2'
  const folderPrefix = process.env.AWS_FOLDER_PREFIX || ''
  
  console.log(`   Bucket: ${bucketName}`)
  console.log(`   Region: ${region}`)
  console.log(`   Folder Prefix: ${folderPrefix}`)
  
  const s3Client = new S3Client({
    region,
    credentials: {
      accessKeyId: credentials.AccessKeyId,
      secretAccessKey: credentials.SecretAccessKey,
      sessionToken: credentials.SessionToken,
    },
  })
  
  // Try to upload a small test file
  const testKey = `${folderPrefix}public/uploads/test-${Date.now()}.txt`
  const testContent = Buffer.from('Test upload at ' + new Date().toISOString())
  
  console.log(`\n   Uploading test file to: ${testKey}`)
  
  try {
    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain',
    }))
    console.log('   ✅ Test file uploaded successfully!')
    
    // Try to generate signed URL
    const signedUrl = await getSignedUrl(s3Client, new GetObjectCommand({
      Bucket: bucketName,
      Key: testKey,
    }), { expiresIn: 3600 })
    
    console.log('   ✅ Signed URL generated successfully!')
    console.log(`   URL: ${signedUrl.substring(0, 100)}...`)
    
    return { success: true, s3Client }
  } catch (error: any) {
    console.error('   ❌ S3 operation failed:', error.message)
    console.error('   Error name:', error.name)
    console.error('   Error code:', error.Code || error.$metadata?.httpStatusCode)
    return { success: false, error }
  }
}

async function testDatabaseConnection() {
  console.log('\n💾 Step 3: Testing Database Connection...')
  
  try {
    // Get a test user
    const users = await prisma.user.findMany({ take: 1 })
    if (users.length === 0) {
      console.log('   ⚠️ No users found in database')
      return { success: false, error: 'No users' }
    }
    
    const testUser = users[0]
    console.log(`   ✅ Found user: ${testUser.email}`)
    console.log(`   User ID: ${testUser.id}`)
    
    // Check VideoAnalysis table schema
    console.log('\n   Checking VideoAnalysis table...')
    const count = await prisma.videoAnalysis.count()
    console.log(`   Total video analyses in database: ${count}`)
    
    // Try to create a test record
    console.log('\n   Testing record creation...')
    const testRecord = await prisma.videoAnalysis.create({
      data: {
        userId: testUser.id,
        videoUrl: 'https://test.example.com/test.mp4',
        fileName: 'test-video.mp4',
        fileSize: 1000,
        duration: 0,
        title: 'Test Upload - Delete Me',
        analysisStatus: 'PENDING',
      }
    })
    console.log(`   ✅ Test record created: ${testRecord.id}`)
    
    // Clean up test record
    await prisma.videoAnalysis.delete({ where: { id: testRecord.id } })
    console.log('   ✅ Test record cleaned up')
    
    return { success: true, user: testUser }
  } catch (error: any) {
    console.error('   ❌ Database operation failed:', error.message)
    if (error.code) {
      console.error('   Prisma error code:', error.code)
    }
    return { success: false, error }
  }
}

async function simulateFullUpload(credentials: Credentials, user: any) {
  console.log('\n🎬 Step 4: Simulating Full Upload Flow...')
  
  const bucketName = process.env.AWS_BUCKET_NAME || 'abacusai-apps-c23443d20cd3d54c25905c2c-us-west-2'
  const region = process.env.AWS_REGION || 'us-west-2'
  const folderPrefix = process.env.AWS_FOLDER_PREFIX || ''
  
  const s3Client = new S3Client({
    region,
    credentials: {
      accessKeyId: credentials.AccessKeyId,
      secretAccessKey: credentials.SecretAccessKey,
      sessionToken: credentials.SessionToken,
    },
  })
  
  // Simulate a video upload
  const fileName = `test-video-${Date.now()}.mp4`
  const s3Key = `${folderPrefix}public/uploads/${fileName}`
  const fakeVideoBuffer = Buffer.alloc(1024 * 10) // 10KB test file
  
  console.log(`   File name: ${fileName}`)
  console.log(`   S3 Key: ${s3Key}`)
  console.log(`   File size: ${fakeVideoBuffer.length} bytes`)
  
  try {
    // Upload to S3
    console.log('\n   Uploading to S3...')
    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: fakeVideoBuffer,
      ContentType: 'video/mp4',
    }))
    console.log('   ✅ S3 upload successful!')
    
    // Generate URL
    console.log('\n   Generating signed URL...')
    const videoUrl = await getSignedUrl(s3Client, new GetObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
    }), { expiresIn: 3600 })
    console.log('   ✅ URL generated!')
    
    // Create database record
    console.log('\n   Creating database record...')
    const videoAnalysis = await prisma.videoAnalysis.create({
      data: {
        userId: user.id,
        videoUrl,
        cloud_storage_path: s3Key,
        isPublic: true,
        fileName,
        fileSize: fakeVideoBuffer.length,
        duration: 0,
        title: 'Test Upload - Safe to Delete',
        analysisStatus: 'PENDING',
      }
    })
    console.log(`   ✅ Database record created: ${videoAnalysis.id}`)
    
    // Cleanup
    console.log('\n   Cleaning up test data...')
    await prisma.videoAnalysis.delete({ where: { id: videoAnalysis.id } })
    console.log('   ✅ Test record deleted')
    
    return { success: true }
  } catch (error: any) {
    console.error('   ❌ Full upload simulation failed:', error.message)
    if (error.code) {
      console.error('   Error code:', error.code)
    }
    return { success: false, error }
  }
}

async function main() {
  console.log('='.repeat(60))
  console.log('VIDEO UPLOAD DIAGNOSTIC TEST')
  console.log('='.repeat(60))
  console.log(`\nTime: ${new Date().toISOString()}`)
  
  try {
    // Step 1: Get credentials
    const credentials = await getAWSCredentials()
    
    // Step 2: Test S3
    const s3Result = await testS3Connection(credentials)
    if (!s3Result.success) {
      console.log('\n❌ S3 TEST FAILED - This is the likely cause of upload failure!')
      return
    }
    
    // Step 3: Test Database
    const dbResult = await testDatabaseConnection()
    if (!dbResult.success) {
      console.log('\n❌ DATABASE TEST FAILED - This is the likely cause of upload failure!')
      return
    }
    
    // Step 4: Full simulation
    const fullResult = await simulateFullUpload(credentials, dbResult.user)
    if (!fullResult.success) {
      console.log('\n❌ FULL UPLOAD SIMULATION FAILED!')
      return
    }
    
    console.log('\n' + '='.repeat(60))
    console.log('✅ ALL TESTS PASSED!')
    console.log('='.repeat(60))
    console.log('\nThe upload infrastructure appears to be working correctly.')
    console.log('The issue may be:')
    console.log('  1. Client-side (browser) issue')
    console.log('  2. Network/CORS issue')
    console.log('  3. Session/authentication issue')
    console.log('  4. File size/type validation issue')
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
