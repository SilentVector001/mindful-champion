import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkComments() {
  try {
    // Find all comments with "Lee" in content or user name
    const comments = await prisma.postComment.findMany({
      where: {
        OR: [
          {
            content: {
              contains: 'Lee',
              mode: 'insensitive'
            }
          },
          {
            User: {
              name: {
                contains: 'Lee',
                mode: 'insensitive'
              }
            }
          }
        ]
      },
      include: {
        User: true,
        CommunityPost: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })
    
    console.log('Found', comments.length, 'comments related to Lee')
    comments.forEach(comment => {
      console.log('\n---')
      console.log('Comment ID:', comment.id)
      console.log('User:', comment.User.name)
      console.log('Content:', comment.content)
      console.log('Post:', comment.CommunityPost?.title)
      console.log('Parent ID:', comment.parentId)
      console.log('Created:', comment.createdAt)
    })
    
    // Also check total comment count
    const totalComments = await prisma.postComment.count()
    console.log('\n\nTotal comments in database:', totalComments)
    
    // Check all comments in chronological order
    const allComments = await prisma.postComment.findMany({
      include: {
        User: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    })
    
    console.log('\n\n=== Last 20 Comments ===')
    allComments.forEach(comment => {
      console.log(`${comment.User.name}: ${comment.content.substring(0, 50)}...`)
    })
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkComments()
