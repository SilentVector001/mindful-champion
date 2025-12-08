const { Resend } = require('resend');
require('dotenv').config({ path: '.env.local' });

async function testEmail() {
  console.log('🔍 Testing Resend API configuration...\n');
  
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    console.error('❌ RESEND_API_KEY not found in environment');
    process.exit(1);
  }
  
  console.log('✅ API Key found:', apiKey.substring(0, 10) + '...');
  
  const resend = new Resend(apiKey);
  
  try {
    console.log('\n📧 Attempting to send test email...\n');
    
    const result = await resend.emails.send({
      from: 'Mindful Champion <noreply@updates.reai.io>',
      to: 'test@example.com', // This will fail but will show us if auth works
      subject: 'Test Email - Mindful Champion',
      html: '<p>This is a test email from Mindful Champion deployment verification.</p>',
    });
    
    console.log('✅ Email API call successful!');
    console.log('Response:', JSON.stringify(result, null, 2));
  } catch (error) {
    if (error.message && error.message.includes('API key')) {
      console.error('❌ API Key authentication failed:', error.message);
      console.error('\nPlease verify:');
      console.error('1. The API key is correct');
      console.error('2. The API key has the correct format (starts with re_)');
      console.error('3. The API key has not expired');
    } else if (error.message && error.message.includes('domain')) {
      console.log('✅ API Key is valid! (Domain configuration note received)');
      console.log('Note:', error.message);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

testEmail();
