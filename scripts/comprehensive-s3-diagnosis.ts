import { S3Client, ListObjectsV2Command, HeadObjectCommand } from "@aws-sdk/client-s3"
import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

// Try to load different .env files
const envLocal = path.join(process.cwd(), '.env.local')
const envFile = path.join(process.cwd(), '.env')

console.log('\n🔍 Comprehensive S3 Diagnosis\n')
console.log('=' .repeat(70))

// Check which .env files exist
console.log('📁 Environment Files:')
console.log(`   .env.local exists: ${fs.existsSync(envLocal) ? '✅' : '❌'}`)
console.log(`   .env exists: ${fs.existsSync(envFile) ? '✅' : '❌'}`)

// Load .env.local first (higher priority for local development)
if (fs.existsSync(envLocal)) {
  console.log('\n   Loading .env.local...')
  dotenv.config({ path: envLocal })
}

// Then load .env (production settings, won't override .env.local)  
if (fs.existsSync(envFile)) {
  console.log('   Loading .env...')
  dotenv.config({ path: envFile })
}

const prisma = new PrismaClient()

async function runDiagnosis() {
  // Step 1: Check environment variables
  console.log('\n' + '=' .repeat(70))
  console.log('1️⃣  Environment Variables Check')
  console.log('=' .repeat(70))
  
  const awsEnv = {
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_PROFILE: process.env.AWS_PROFILE,
    AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME,
    AWS_REGION: process.env.AWS_REGION,
    AWS_FOLDER_PREFIX: process.env.AWS_FOLDER_PREFIX,
  }
  
  Object.entries(awsEnv).forEach(([key, value]) => {
    if (key.includes('SECRET') || key.includes('ACCESS_KEY')) {
      console.log(`   ${key}: ${value ? '✅ SET (' + value.substring(0, 4) + '*****)' : '❌ NOT SET'}`)
    } else {
      console.log(`   ${key}: ${value ? '✅ ' + value : '❌ NOT SET'}`)
    }
  })

  const hasExplicitCredentials = !!(awsEnv.AWS_ACCESS_KEY_ID && awsEnv.AWS_SECRET_ACCESS_KEY)
  const hasProfile = !!awsEnv.AWS_PROFILE
  const hasBucket = !!awsEnv.AWS_BUCKET_NAME
  
  console.log('\n   Credential Status:')
  if (hasExplicitCredentials) {
    console.log('   ✅ Explicit AWS credentials configured (ACCESS_KEY + SECRET)')
  } else if (hasProfile) {
    console.log(`   ⚠️  Using AWS Profile: ${awsEnv.AWS_PROFILE}`)
    console.log('   📝 Note: Profile requires ~/.aws/credentials file')
    
    // Check if credentials file exists
    const homeDir = process.env.HOME || process.env.USERPROFILE
    const awsCredsPath = path.join(homeDir!, '.aws', 'credentials')
    const credFileExists = fs.existsSync(awsCredsPath)
    
    if (credFileExists) {
      console.log('   ✅ AWS credentials file found at ~/.aws/credentials')
    } else {
      console.log('   ❌ AWS credentials file NOT found at ~/.aws/credentials')
      console.log('   🔴 Profile will NOT work without this file!')
    }
  } else {
    console.log('   ❌ NO AWS credentials configured')
  }

  // Step 2: Check database for videos with S3 paths
  console.log('\n' + '=' .repeat(70))
  console.log('2️⃣  Database Check - Videos with S3 Paths')
  console.log('=' .repeat(70))
  
  try {
    const videosWithS3 = await prisma.videoAnalysis.findMany({
      where: {
        cloud_storage_path: {
          not: null
        }
      },
      orderBy: {
        uploadedAt: 'desc'
      },
      take: 5,
      select: {
        id: true,
        title: true,
        cloud_storage_path: true,
        uploadedAt: true,
        analysisStatus: true,
        user: {
          select: {
            email: true
          }
        }
      }
    })

    console.log(`   Found ${videosWithS3.length} videos with S3 paths`)
    
    if (videosWithS3.length > 0) {
      console.log('\n   Recent uploads:')
      videosWithS3.forEach((video, i) => {
        console.log(`   ${i + 1}. ${video.title}`)
        console.log(`      Path: ${video.cloud_storage_path}`)
        console.log(`      Uploaded: ${video.uploadedAt.toISOString()}`)
        console.log(`      Status: ${video.analysisStatus}`)
        console.log(`      User: ${video.user?.email}`)
        console.log()
      })
    }

    // Step 3: Try to connect to S3 and check if files exist
    if (hasBucket && videosWithS3.length > 0) {
      console.log('=' .repeat(70))
      console.log('3️⃣  S3 Connection Test')
      console.log('=' .repeat(70))
      
      try {
        const s3Client = new S3Client({
          region: awsEnv.AWS_REGION || 'us-west-2',
          ...(hasExplicitCredentials ? {
            credentials: {
              accessKeyId: awsEnv.AWS_ACCESS_KEY_ID!,
              secretAccessKey: awsEnv.AWS_SECRET_ACCESS_KEY!
            }
          } : {})
        })

        console.log(`   Connecting to bucket: ${awsEnv.AWS_BUCKET_NAME}`)
        console.log(`   Region: ${awsEnv.AWS_REGION || 'us-west-2'}`)
        
        // Try to list objects
        try {
          const listCommand = new ListObjectsV2Command({
            Bucket: awsEnv.AWS_BUCKET_NAME,
            MaxKeys: 10,
            Prefix: awsEnv.AWS_FOLDER_PREFIX || ''
          })
          
          const listResponse = await s3Client.send(listCommand)
          console.log(`   ✅ Successfully connected to S3`)
          console.log(`   📊 Found ${listResponse.Contents?.length || 0} objects in bucket`)
          
          // Check if specific video files exist
          console.log('\n   Checking if database videos exist in S3...')
          for (const video of videosWithS3.slice(0, 3)) {
            try {
              const headCommand = new HeadObjectCommand({
                Bucket: awsEnv.AWS_BUCKET_NAME,
                Key: video.cloud_storage_path!
              })
              
              await s3Client.send(headCommand)
              console.log(`   ✅ ${video.title}: EXISTS in S3`)
            } catch (error: any) {
              if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
                console.log(`   ❌ ${video.title}: NOT FOUND in S3`)
                console.log(`      🔴 ISSUE: Database has S3 path but file doesn't exist!`)
              } else {
                console.log(`   ⚠️  ${video.title}: Error checking (${error.message})`)
              }
            }
          }
          
        } catch (error: any) {
          console.log(`   ❌ Failed to connect to S3: ${error.message}`)
          
          if (error.name === 'CredentialsProviderError') {
            console.log('\n   🔴 CREDENTIALS ERROR:')
            console.log('      - AWS SDK cannot find valid credentials')
            console.log('      - If using AWS_PROFILE, ensure ~/.aws/credentials exists')
            console.log('      - Or set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY')
          } else if (error.name === 'NoSuchBucket') {
            console.log('\n   🔴 BUCKET ERROR:')
            console.log(`      - Bucket "${awsEnv.AWS_BUCKET_NAME}" does not exist`)
            console.log('      - Or you don\'t have permission to access it')
          } else if (error.name === 'AccessDenied') {
            console.log('\n   🔴 PERMISSION ERROR:')
            console.log('      - Credentials are valid but lack permissions')
            console.log('      - Check IAM policies for S3 access')
          }
        }
      } catch (error: any) {
        console.log(`   ❌ Failed to initialize S3 client: ${error.message}`)
      }
    }

  } catch (error: any) {
    console.log(`   ❌ Database error: ${error.message}`)
  }

  // Final diagnosis
  console.log('\n' + '=' .repeat(70))
  console.log('🎯 DIAGNOSIS SUMMARY')
  console.log('=' .repeat(70))
  
  if (!hasBucket) {
    console.log('   🔴 CRITICAL: AWS_BUCKET_NAME not configured')
    console.log('   ➡️  S3 uploads will FAIL')
  } else if (!hasExplicitCredentials && !hasProfile) {
    console.log('   🔴 CRITICAL: No AWS credentials configured')
    console.log('   ➡️  S3 uploads will FAIL')
    console.log('   ➡️  Videos in database cannot be retrieved')
  } else if (hasProfile && !fs.existsSync(path.join(process.env.HOME || '', '.aws', 'credentials'))) {
    console.log('   🔴 CRITICAL: AWS_PROFILE set but credentials file missing')
    console.log('   ➡️  S3 operations will FAIL')
  } else {
    console.log('   ✅ AWS configuration appears correct')
    console.log('   ➡️  Check S3 connection test results above')
  }
  
  console.log('\n' + '=' .repeat(70))
  console.log('💡 RECOMMENDED ACTIONS')
  console.log('=' .repeat(70))
  console.log('   1. Add AWS credentials to .env.local for local development:')
  console.log('      AWS_ACCESS_KEY_ID=your_access_key')
  console.log('      AWS_SECRET_ACCESS_KEY=your_secret_key')
  console.log('      AWS_BUCKET_NAME=your_bucket_name')
  console.log('      AWS_REGION=us-west-2')
  console.log('      AWS_FOLDER_PREFIX=6482/')
  console.log('')
  console.log('   2. OR configure AWS CLI with credentials:')
  console.log('      aws configure --profile hosted_storage')
  console.log('')
  console.log('   3. Verify credentials have proper S3 permissions')
  console.log('')
  console.log('=' .repeat(70) + '\n')
  
  await prisma.$disconnect()
}

runDiagnosis().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
