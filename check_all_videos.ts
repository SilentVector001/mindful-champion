import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Count all videos
    const totalCount = await prisma.trainingVideo.count()
    console.log(`Total videos in database: ${totalCount}`)
    
    // Count placeholder videos
    const placeholderCount = await prisma.trainingVideo.count({
      where: {
        videoId: {
          startsWith: 'YT_'
        }
      }
    })
    console.log(`Placeholder videos: ${placeholderCount}`)
    
    // Count real videos
    const realCount = await prisma.trainingVideo.count({
      where: {
        NOT: {
          videoId: {
            startsWith: 'YT_'
          }
        }
      }
    })
    console.log(`Real videos: ${realCount}`)
    
    // Get a few real videos
    console.log('\nSample real videos:')
    const realVideos = await prisma.trainingVideo.findMany({
      where: {
        NOT: {
          videoId: {
            startsWith: 'YT_'
          }
        }
      },
      take: 3
    })
    
    realVideos.forEach((video, idx) => {
      console.log(`\n${idx + 1}. ${video.title}`)
      console.log(`   videoId: ${video.videoId}`)
      console.log(`   thumbnailUrl: ${video.thumbnailUrl}`)
      console.log(`   url: ${video.url}`)
    })
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
