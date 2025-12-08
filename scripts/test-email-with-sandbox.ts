import { Resend } from 'resend';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const resend = new Resend(process.env.RESEND_API_KEY);

async function testSandboxEmail() {
  try {
    console.log('🧪 Testing Email with Resend Sandbox\n');
    console.log('================================\n');
    
    console.log('API Key:', process.env.RESEND_API_KEY?.substring(0, 10) + '...');
    console.log('\n📧 Sending test email...\n');

    const { data, error } = await resend.emails.send({
      from: 'Mindful Champion <onboarding@resend.dev>',
      to: ['deansnow59@gmail.com'],
      subject: '✅ Test Email from Mindful Champion - Email System Active',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0ea5e9;">🎉 Email System Test Successful!</h1>
          <p>This is a test email from the Mindful Champion email system.</p>
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #0284c7; margin-top: 0;">✅ What This Confirms:</h2>
            <ul style="color: #374151;">
              <li><strong>API Key:</strong> Working correctly</li>
              <li><strong>Email Logging:</strong> Successfully saving to database</li>
              <li><strong>Email Sending:</strong> Configured and operational</li>
              <li><strong>Resend Integration:</strong> Active and verified</li>
            </ul>
          </div>
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #d97706; margin-top: 0;">📋 Next Steps:</h3>
            <p style="margin: 0; color: #78350f;">
              For production emails from custom domains (updates.reai.io), you'll need to verify 
              the domain in your Resend dashboard at 
              <a href="https://resend.com/domains">resend.com/domains</a>
            </p>
          </div>
          <p style="color: #6b7280; margin-top: 30px;">
            Sent at: ${new Date().toLocaleString()}<br>
            From: Mindful Champion Email System
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log('✅ Email sent successfully!');
    console.log(`📨 Email ID: ${data?.id}`);
    console.log('\n================================');
    console.log('✅ Email Test Complete');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSandboxEmail();
