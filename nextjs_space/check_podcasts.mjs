import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkPodcasts() {
  try {
    const shows = await prisma.podcastShow.findMany({
      include: {
        episodes: {
          orderBy: { publishDate: 'desc' },
          take: 5
        }
      }
    });
    
    console.log('Podcast Shows found:', shows.length);
    
    shows.forEach(show => {
      console.log('\n---');
      console.log('Show:', show.title);
      console.log('Episodes:', show.episodes.length);
      if (show.episodes.length > 0) {
        console.log('Latest episode date:', show.episodes[0].publishDate);
        console.log('Latest episode title:', show.episodes[0].title);
      }
    });
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    await prisma.$disconnect();
  }
}

checkPodcasts();
