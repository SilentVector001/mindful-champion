import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env file from project root
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

import { getResendClient } from '../lib/email/resend-client';

async function testResendAPI() {
  console.log('\n🧪 Testing Resend API Configuration\n');
  console.log('=' .repeat(60));
  
  try {
    const resend = getResendClient();
    
    console.log('\n✅ Resend client initialized');
    console.log(`📧 RESEND_API_KEY found: ${process.env.RESEND_API_KEY ? 'YES' : 'NO'}`);
    console.log(`🔑 API Key preview: ${process.env.RESEND_API_KEY?.substring(0, 10)}...`);
    
    // Try to send a test email to a safe address
    const testEmail = 'test@resend.dev'; // Resend's test email address
    
    console.log(`\n📤 Attempting to send test email to ${testEmail}...\n`);
    
    const result = await resend.emails.send({
      from: 'Mindful Champion <noreply@mindfulchampion.com>',
      to: testEmail,
      subject: '🧪 Test Email - Mindful Champion',
      html: '<h1>Test Email</h1><p>This is a test email from the Mindful Champion email system.</p>',
      text: 'Test Email\n\nThis is a test email from the Mindful Champion email system.',
    });
    
    if (result.error) {
      console.error('❌ Error sending test email:', result.error);
      console.error('\n📝 Possible issues:');
      console.error('  1. Invalid API key');
      console.error('  2. Domain not verified in Resend');
      console.error('  3. API key lacks necessary permissions');
      console.error('  4. Rate limit exceeded');
      return false;
    }
    
    console.log('✅ Test email sent successfully!');
    console.log(`📨 Email ID: ${result.data?.id}`);
    console.log('\n✨ Resend API is configured correctly and working!\n');
    
    return true;
  } catch (error: any) {
    console.error('❌ Fatal error testing Resend API:', error);
    console.error('\n📝 Error details:', error.message);
    return false;
  }
}

testResendAPI();
