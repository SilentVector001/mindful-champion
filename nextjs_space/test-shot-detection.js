/**
 * Quick test script to verify shot detection system
 * 
 * Usage: node test-shot-detection.js
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Shot Detection System Test\n');

// Test 1: Check FFmpeg installation
console.log('Test 1: Checking FFmpeg installation...');
const { execSync } = require('child_process');
try {
  const ffmpegVersion = execSync('ffmpeg -version').toString().split('\n')[0];
  console.log('✅ FFmpeg is installed:', ffmpegVersion);
} catch (error) {
  console.error('❌ FFmpeg not found. Please install: sudo apt-get install ffmpeg');
  process.exit(1);
}

// Test 2: Check LLM API key
console.log('\nTest 2: Checking LLM API configuration...');
require('dotenv').config();
if (process.env.ABACUSAI_API_KEY) {
  console.log('✅ ABACUSAI_API_KEY is configured');
} else {
  console.error('❌ ABACUSAI_API_KEY not found in .env file');
  process.exit(1);
}

// Test 3: Check required files
console.log('\nTest 3: Checking required files...');
const requiredFiles = [
  'lib/video-analysis/llm-shot-detector.ts',
  'app/api/video-analysis/detect-shots/route.ts',
  'app/api/video-analysis/analyze-enhanced/route.ts',
  'components/video-analysis/shot-by-shot-breakdown.tsx',
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.error(`❌ Missing: ${file}`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.error('\n❌ Some required files are missing');
  process.exit(1);
}

// Test 4: Check Prisma schema
console.log('\nTest 4: Checking Prisma schema...');
const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
if (fs.existsSync(schemaPath)) {
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  if (schemaContent.includes('detectedShots')) {
    console.log('✅ Prisma schema includes detectedShots field');
  } else {
    console.error('❌ Prisma schema missing detectedShots field');
    console.log('   Run: cd /home/ubuntu/mindful_champion/nextjs_space && yarn prisma generate && yarn prisma db push');
    process.exit(1);
  }
} else {
  console.error('❌ Prisma schema file not found');
  process.exit(1);
}

// Test 5: Check public uploads directory
console.log('\nTest 5: Checking uploads directory...');
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (fs.existsSync(uploadsDir)) {
  const files = fs.readdirSync(uploadsDir);
  const videoFiles = files.filter(f => 
    f.endsWith('.mp4') || f.endsWith('.mov') || f.endsWith('.avi') || f.endsWith('.webm')
  );
  console.log(`✅ Uploads directory exists with ${videoFiles.length} video files`);
  if (videoFiles.length > 0) {
    console.log('   Sample videos:', videoFiles.slice(0, 3).join(', '));
  }
} else {
  console.log('⚠️  Uploads directory not found (will be created on first upload)');
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('✅ All tests passed! Shot detection system is ready.');
console.log('='.repeat(50));

console.log('\n📋 Next Steps:');
console.log('1. Upload a pickleball video through the web interface');
console.log('2. Click "Analyze Video" to trigger shot detection');
console.log('3. Wait 1-3 minutes for analysis to complete');
console.log('4. View results in Shot-by-Shot Breakdown tab');

console.log('\n🔍 To test with existing video:');
console.log('1. Navigate to /train/video in the web app');
console.log('2. Select any analyzed video');
console.log('3. Check the Shot-by-Shot Breakdown section');
console.log('4. Verify shot types are accurate (not generic mock data)');

console.log('\n📊 Expected Results:');
console.log('- Serve shots labeled as "Serve" (not "Forehand Drive")');
console.log('- Dinks identified correctly with positioning context');
console.log('- Quality scores vary based on actual technique');
console.log('- Specific feedback per shot type');
console.log('\n');
