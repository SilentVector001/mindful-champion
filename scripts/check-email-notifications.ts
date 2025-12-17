#!/usr/bin/env tsx

import { prisma } from '../lib/db'

async function main() {
  const count = await prisma.emailNotification.count()
  console.log(`Total email notifications: ${count}`)

  const recentEmails = await prisma.emailNotification.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      recipientEmail: true,
      status: true,
      type: true,
      subject: true,
      createdAt: true,
      error: true,
    }
  })

  console.log('\nRecent emails:')
  if (recentEmails.length === 0) {
    console.log('No emails found in the database.')
  } else {
    recentEmails.forEach((email, i) => {
      console.log(`\n${i + 1}. ${email.subject}`)
      console.log(`   To: ${email.recipientEmail}`)
      console.log(`   Status: ${email.status}`)
      console.log(`   Type: ${email.type}`)
      console.log(`   Created: ${email.createdAt}`)
      if (email.error) {
        console.log(`   Error: ${email.error}`)
      }
    })
  }

  await prisma.$disconnect()
}

main()
