import { prisma } from './lib/db';

async function testConversation() {
  try {
    // Get first conversation
    const conversations = await prisma.aIConversation.findMany({
      take: 1,
      include: {
        user: true,
        messages: true
      }
    });
    
    console.log('Found conversations:', conversations.length);
    if (conversations.length > 0) {
      const conv = conversations[0];
      console.log('\nConversation ID:', conv.id);
      console.log('User:', conv.user?.email);
      console.log('Messages:', conv.messages.length);
      
      // Try to fetch conversation details like the API does
      try {
        const conversation = await prisma.aIConversation.findUnique({
          where: { id: conv.id },
          include: {
            messages: {
              orderBy: { createdAt: 'asc' }
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                firstName: true,
                lastName: true,
                skillLevel: true,
                playerRating: true,
                primaryGoals: true,
                biggestChallenges: true,
                accountLocked: true,
                accountLockedReason: true,
                createdAt: true,
                lastActiveDate: true,
              }
            }
          }
        });
        
        console.log('\n✅ Fetched conversation successfully!');
        
        // Get flagged messages
        const flaggedMessages = await prisma.flaggedMessage.findMany({
          where: { conversationId: conv.id }
        });
        console.log('Flagged messages:', flaggedMessages.length);
        
        // Get admin notes
        const adminNotes = await prisma.adminNote.findMany({
          where: { userId: conv.userId },
          take: 10
        });
        console.log('Admin notes:', adminNotes.length);
        
        // Get user warnings
        const userWarnings = await prisma.userWarning.findMany({
          where: { userId: conv.userId },
          take: 10
        });
        console.log('User warnings:', userWarnings.length);
      } catch (error) {
        console.error('❌ Error fetching conversation details:', error);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConversation();
