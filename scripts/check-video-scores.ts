import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const prisma = new PrismaClient()

async function checkScores() {
  try {
    const videos = await prisma.videoAnalysis.findMany({
      where: {
        analysisStatus: 'COMPLETED'
      },
      select: {
        id: true,
        title: true,
        overallScore: true,
        analyzedAt: true,
        analysisStatus: true
      },
      orderBy: {
        uploadedAt: 'desc'
      },
      take: 20
    })

    console.log('\n===== VIDEO ANALYSIS SCORES =====\n')
    console.log(`Total completed analyses: ${videos.length}\n`)
    
    videos.forEach((video, idx) => {
      console.log(`${idx + 1}. ${video.title}`)
      console.log(`   ID: ${video.id}`)
      console.log(`   Status: ${video.analysisStatus}`)
      console.log(`   Score: ${video.overallScore === null ? 'NULL' : video.overallScore}`)
      console.log(`   Analyzed: ${video.analyzedAt?.toISOString() || 'N/A'}`)
      console.log('')
    })

    const nullScores = videos.filter(v => v.overallScore === null)
    if (nullScores.length > 0) {
      console.log(`⚠️  WARNING: ${nullScores.length} completed videos have NULL scores!`)
      
      // Show IDs of problematic videos
      console.log('\nProblematic Video IDs:')
      nullScores.forEach(v => console.log(`  - ${v.id}: ${v.title}`))
    } else {
      console.log('✅ All completed videos have valid scores')
    }

    await prisma.$disconnect()
  } catch (error) {
    console.error('Error:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

checkScores()
