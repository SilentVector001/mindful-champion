import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()

async function checkEmailRecords() {
  try {
    console.log('🔍 Checking Email Records in Database...\n')
    
    // Count total email notifications
    const totalEmails = await prisma.emailNotification.count()
    console.log(`📊 Total Email Notifications: ${totalEmails}`)
    
    // Get recent emails
    const recentEmails = await prisma.emailNotification.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })
    
    console.log(`\n📧 Recent 10 Email Records:`)
    console.log('='.repeat(80))
    
    if (recentEmails.length === 0) {
      console.log('❌ NO EMAIL RECORDS FOUND IN DATABASE')
    } else {
      recentEmails.forEach((email, index) => {
        console.log(`\n${index + 1}. ${email.type}`)
        console.log(`   To: ${email.recipientEmail} (${email.user?.firstName || 'Unknown'} ${email.user?.lastName || ''})`)
        console.log(`   Subject: ${email.subject}`)
        console.log(`   Status: ${email.status}`)
        console.log(`   Sent At: ${email.sentAt || 'Not sent'}`)
        console.log(`   Created At: ${email.createdAt}`)
      })
    }
    
    // Count by status
    const statusCounts = await prisma.emailNotification.groupBy({
      by: ['status'],
      _count: true
    })
    
    console.log(`\n\n📊 Email Status Breakdown:`)
    console.log('='.repeat(80))
    statusCounts.forEach(stat => {
      console.log(`${stat.status}: ${stat._count}`)
    })
    
    // Count by type
    const typeCounts = await prisma.emailNotification.groupBy({
      by: ['type'],
      _count: true
    })
    
    console.log(`\n📊 Email Type Breakdown:`)
    console.log('='.repeat(80))
    typeCounts.forEach(stat => {
      console.log(`${stat.type}: ${stat._count}`)
    })
    
  } catch (error) {
    console.error('❌ Error checking email records:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkEmailRecords()
