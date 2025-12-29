
/**
 * COACH KAI - DUPLICATE MESSAGE CLEANUP SCRIPT
 * 
 * This script removes duplicate messages from the AIMessage table.
 * Duplicates are identified by having the same conversationId, role, content, and timestamp.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupDuplicateMessages() {
  console.log('🔍 Starting duplicate message cleanup...\n')

  try {
    // Get all conversations
    const conversations = await prisma.aIConversation.findMany({
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    console.log(`📊 Found ${conversations.length} conversations\n`)

    let totalDuplicatesFound = 0
    let totalDuplicatesRemoved = 0

    for (const conversation of conversations) {
      const messages = conversation.messages
      const seen = new Map<string, string>() // key: content+role, value: messageId (keep first)
      const duplicatesToDelete: string[] = []

      for (const message of messages) {
        const key = `${message.role}:${message.content}`
        
        if (seen.has(key)) {
          // This is a duplicate - mark for deletion
          duplicatesToDelete.push(message.id)
          totalDuplicatesFound++
        } else {
          // First occurrence - keep it
          seen.set(key, message.id)
        }
      }

      if (duplicatesToDelete.length > 0) {
        console.log(`\n🔧 Conversation ${conversation.id}:`)
        console.log(`   Total messages: ${messages.length}`)
        console.log(`   Duplicates found: ${duplicatesToDelete.length}`)
        
        // Delete duplicates
        const deleteResult = await prisma.aIMessage.deleteMany({
          where: {
            id: {
              in: duplicatesToDelete
            }
          }
        })

        totalDuplicatesRemoved += deleteResult.count
        
        console.log(`   ✅ Removed: ${deleteResult.count} duplicate messages`)

        // Update conversation message count
        const remainingCount = messages.length - deleteResult.count
        await prisma.aIConversation.update({
          where: { id: conversation.id },
          data: { messageCount: remainingCount }
        })
        
        console.log(`   📊 Updated message count to: ${remainingCount}`)
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('✨ CLEANUP COMPLETE')
    console.log('='.repeat(60))
    console.log(`Total duplicates found: ${totalDuplicatesFound}`)
    console.log(`Total duplicates removed: ${totalDuplicatesRemoved}`)
    console.log('='.repeat(60) + '\n')

  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the cleanup
cleanupDuplicateMessages()
  .then(() => {
    console.log('👍 Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })
