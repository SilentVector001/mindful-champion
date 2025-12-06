import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Deleting placeholder videos...')
    
    const result = await prisma.trainingVideo.deleteMany({
      where: {
        videoId: {
          startsWith: 'YT_'
        }
      }
    })
    
    console.log(`✅ Deleted ${result.count} placeholder videos`)
    
    // Verify
    const remaining = await prisma.trainingVideo.count()
    console.log(`✅ Remaining videos: ${remaining}`)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
