#!/usr/bin/env node
/**
 * Password Reset Script for Mindful Champion
 * 
 * Resets the password for a specific user account in the Neon PostgreSQL database.
 * Uses Prisma ORM and bcryptjs for secure password hashing.
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Configuration
const USER_EMAIL = 'deansnow59@gmail.com';
const NEW_PASSWORD = 'MindfulChampion2025!';

async function resetPassword() {
  try {
    console.log('🔐 Starting password reset process...\n');
    
    // Find the user
    console.log(`📧 Looking for user: ${USER_EMAIL}`);
    const user = await prisma.user.findUnique({
      where: { email: USER_EMAIL },
      select: { id: true, email: true, name: true }
    });

    if (!user) {
      console.error(`❌ User not found: ${USER_EMAIL}`);
      process.exit(1);
    }

    console.log(`✅ User found: ${user.name || 'N/A'} (${user.email})`);
    console.log(`   User ID: ${user.id}\n`);

    // Hash the new password
    console.log('🔒 Hashing new password...');
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);
    console.log(`✅ Password hashed successfully\n`);

    // Update the user's password
    console.log('💾 Updating password in database...');
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        password: hashedPassword,
        updatedAt: new Date()
      }
    });

    console.log('✅ Password updated successfully!\n');
    console.log('═══════════════════════════════════════════');
    console.log('  ✨ Password Reset Complete ✨');
    console.log('═══════════════════════════════════════════');
    console.log(`  Email:    ${USER_EMAIL}`);
    console.log(`  Password: ${NEW_PASSWORD}`);
    console.log('═══════════════════════════════════════════\n');
    console.log('🌐 You can now sign in at: https://mindfulchampion.com/auth/signin\n');

  } catch (error) {
    console.error('❌ Error resetting password:', error.message);
    console.error('\nFull error details:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
resetPassword();
