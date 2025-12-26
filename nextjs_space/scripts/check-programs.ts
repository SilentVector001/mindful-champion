import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function check() {
  const programs = await prisma.trainingProgram.findMany()
  console.log(`\n✅ Found ${programs.length} training programs:`)
  programs.forEach(p => {
    console.log(`   - ${p.name} (${p.skillLevel}, ${p.durationDays} days)`)
  })
  
  const videos = await prisma.trainingVideo.count()
  console.log(`\n📹 Total training videos: ${videos}`)
  
  const programVideos = await prisma.programVideo.count()
  console.log(`🔗 Program-Video links: ${programVideos}\n`)
  
  await prisma.$disconnect()
}

check().catch(console.error)
