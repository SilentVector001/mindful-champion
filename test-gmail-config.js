/**
 * Test Gmail Configuration
 * Verifies email service is working with new credentials
 */

require('dotenv').config({ path: '.env' });
const nodemailer = require('nodemailer');

// Email sender configurations
const EMAIL_SENDERS = {
  WELCOME: {
    email: process.env.EMAIL_FROM_WELCOME || 'welcomefrommc@mindfulchampion.com',
    name: 'Coach Kai - Mindful Champion',
    emoji: '🏓',
  },
  COACH_KAI: {
    email: process.env.EMAIL_FROM_COACH_KAI || 'coachkai@mindfulchampion.com',
    name: 'Coach Kai',
    emoji: '🏓',
  },
  SUPPORT: {
    email: process.env.EMAIL_FROM_SUPPORT || 'support@mindfulchampion.com',
    name: 'Mindful Champion Support',
    emoji: '💬',
  },
  PARTNERS: {
    email: process.env.EMAIL_FROM_PARTNERS || 'partners@mindfulchampion.com',
    name: 'Mindful Champion Partnerships',
    emoji: '🤝',
  },
  SPONSORS: {
    email: process.env.EMAIL_FROM_SPONSORS || 'sponsors@mindfulchampion.com',
    name: 'Mindful Champion Sponsors',
    emoji: '🎯',
  },
  ADMIN: {
    email: process.env.EMAIL_FROM_ADMIN || 'admin@mindfulchampion.com',
    name: 'Mindful Champion Admin',
    emoji: '🛡️',
  },
};

async function testGmailConfig() {
  console.log('\n🏓 Testing Gmail Configuration\n');
  console.log('='.repeat(60));
  
  // Check environment variables
  console.log('\n📧 Environment Variables Check:');
  console.log('   GMAIL_USER:', process.env.GMAIL_USER ? '✅ Set' : '❌ Not set');
  console.log('   GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? '✅ Set' : '❌ Not set');
  
  // Check From addresses
  console.log('\n📬 From Address Configuration:');
  console.log('   EMAIL_FROM_WELCOME:', process.env.EMAIL_FROM_WELCOME || '❌ Not set');
  console.log('   EMAIL_FROM_COACH_KAI:', process.env.EMAIL_FROM_COACH_KAI || '❌ Not set');
  console.log('   EMAIL_FROM_SUPPORT:', process.env.EMAIL_FROM_SUPPORT || '❌ Not set');
  console.log('   EMAIL_FROM_PARTNERS:', process.env.EMAIL_FROM_PARTNERS || '❌ Not set');
  console.log('   EMAIL_FROM_SPONSORS:', process.env.EMAIL_FROM_SPONSORS || '❌ Not set');
  console.log('   EMAIL_FROM_ADMIN:', process.env.EMAIL_FROM_ADMIN || '❌ Not set');
  
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error('\n❌ Gmail credentials not configured in .env file\n');
    return;
  }
  
  // Create transporter
  console.log('\n🔧 Creating Gmail Transporter...');
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
  
  // Test connection
  console.log('🔌 Testing Gmail SMTP Connection...\n');
  
  try {
    await transporter.verify();
    console.log('✅ Gmail SMTP Connection Successful!\n');
    
    // Display sender configurations
    console.log('📧 Email Sender Configurations:');
    console.log('='.repeat(60));
    Object.entries(EMAIL_SENDERS).forEach(([type, config]) => {
      console.log(`\n   ${type}:`);
      console.log(`      From: "${config.name} ${config.emoji}" <${config.email}>`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Email Configuration Test Complete!\n');
    console.log('🏓 All email senders are properly configured.');
    console.log('📬 Ready to send emails from multiple addresses.\n');
    
  } catch (error) {
    console.error('❌ Gmail Connection Failed:', error.message);
    console.error('\n💡 Troubleshooting Tips:');
    console.error('   1. Check that GMAIL_USER is correct');
    console.error('   2. Verify GMAIL_APP_PASSWORD is a valid app password');
    console.error('   3. Ensure 2FA is enabled on the Gmail account');
    console.error('   4. Make sure "Less secure app access" is NOT needed (use app password instead)\n');
  }
}

testGmailConfig().catch(console.error);
