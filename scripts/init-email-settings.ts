#!/usr/bin/env tsx

/**
 * Initialize Email Settings
 * 
 * This script ensures that the EmailSettings table has a default record.
 * Run this if you're getting errors when accessing the admin email notifications page.
 */

import { prisma } from '../lib/db'
import { emailService } from '../lib/email/email-service'

async function main() {
  console.log('🚀 Initializing email settings...')

  try {
    // Check if settings already exist
    const existing = await prisma.emailSettings.findFirst()

    if (existing) {
      console.log('✅ Email settings already exist:')
      console.log(JSON.stringify(existing, null, 2))
    } else {
      // Initialize settings
      await emailService.initializeEmailSettings()
      console.log('✅ Email settings initialized successfully')

      // Fetch and display the new settings
      const settings = await prisma.emailSettings.findFirst()
      console.log('Created settings:')
      console.log(JSON.stringify(settings, null, 2))
    }

    console.log('\n✅ Email settings initialization complete')
  } catch (error) {
    console.error('❌ Failed to initialize email settings:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
