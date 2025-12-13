import { prisma } from '../lib/db'

async function checkVideoCounts() {
  console.log('==========================================')
  console.log('VIDEO COUNTS ANALYSIS')
  console.log('==========================================\n')
  
  try {
    // 1. Training Videos (curated YouTube videos for training programs)
    const trainingVideos = await prisma.trainingVideo.count()
    console.log('📚 TRAINING SECTION:')
    console.log(`   Unique Training Videos: ${trainingVideos}`)
    
    // 2. Program-Video Links (how many times videos are linked to program days)
    const programVideoLinks = await prisma.programVideo.count()
    console.log(`   Program-Video Links: ${programVideoLinks}`)
    
    // 3. Training Programs
    const programs = await prisma.trainingProgram.count()
    console.log(`   Training Programs: ${programs}`)
    
    // 4. Program Days
    const programDays = await prisma.programDay.count()
    console.log(`   Total Program Days: ${programDays}`)
    
    console.log('\n📊 BREAKDOWN:')
    console.log(`   • ${programs} training programs`)
    console.log(`   • ${programDays} total days across all programs`)
    console.log(`   • ${trainingVideos} unique YouTube videos curated`)
    console.log(`   • ${programVideoLinks} program-video links (videos reused across days)`)
    console.log(`   • Average: ${Math.round(programVideoLinks / trainingVideos * 10) / 10}x reuse per video\n`)
    
    // 5. Get program details
    const programDetails = await prisma.trainingProgram.findMany({
      select: {
        name: true,
        _count: {
          select: {
            days: true,
            videos: true,
          }
        }
      }
    })
    
    console.log('📋 PROGRAM DETAILS:')
    programDetails.forEach(p => {
      console.log(`   ${p.name}:`)
      console.log(`      - ${p._count.days} days`)
      console.log(`      - ${p._count.videos} video links`)
    })
    
    // 6. Check for Video Analysis (uploaded user videos)
    const videoAnalyses = await prisma.videoAnalysis.count().catch(() => 0)
    console.log(`\n🎥 VIDEO ANALYSIS:`)
    console.log(`   User Uploaded Videos: ${videoAnalyses}`)
    
    console.log('\n==========================================')
    console.log('EXPLANATION:')
    console.log('==========================================')
    console.log('\n🎯 TRAINING SECTION (/train):')
    console.log('   Location: /train → Training Programs')
    console.log(`   ${trainingVideos} unique YouTube videos from top coaches`)
    console.log(`   ${programVideoLinks} connections (videos linked to specific days)`)
    console.log('   Some videos appear in multiple programs/days')
    console.log('')
    console.log('🎯 VIDEO LIBRARY (/train/library):')
    console.log('   Location: /train/library')
    console.log('   12 featured YouTube videos (hardcoded samples)')
    console.log('   Separate from training programs')
    console.log('   Curated highlights and tutorials')
    console.log('')
    console.log('🎯 VIDEO ANALYSIS (/train/video):')
    console.log('   Location: /train/video')
    console.log(`   ${videoAnalyses} videos uploaded by users for AI analysis`)
    console.log('   Different from training/library videos')
    console.log('\n==========================================\n')
    
  } catch (error) {
    console.error('Error checking video counts:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkVideoCounts()
