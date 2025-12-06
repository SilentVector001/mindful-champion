import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const videos = await prisma.trainingVideo.findMany({
      take: 5
    })
    
    console.log(`Total videos in database: ${videos.length}`)
    console.log('\nFirst 5 videos:')
    videos.forEach((video, idx) => {
      console.log(`\n${idx + 1}. ${video.title}`)
      console.log(`   videoId: ${video.videoId}`)
      console.log(`   thumbnailUrl: ${video.thumbnailUrl || 'NULL'}`)
      console.log(`   url: ${video.url}`)
    })
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
