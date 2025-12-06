require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('🔍 Testing email configuration...\n');
  console.log('Gmail User:', process.env.GMAIL_USER);
  console.log('Password length:', process.env.GMAIL_APP_PASSWORD?.length || 0);
  console.log('Password format:', process.env.GMAIL_APP_PASSWORD?.includes(' ') ? 'contains spaces' : 'no spaces');
  console.log('');

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  try {
    console.log('📧 Attempting to send test email...');
    
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      subject: 'Mindful Champion - Email Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">✅ Email System Test Successful!</h1>
          <p>This is a test email from your Mindful Champion app.</p>
          <p>Your email system is configured correctly and ready to send welcome emails to new users.</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
        </div>
      `,
    });

    console.log('✅ SUCCESS! Test email sent successfully to', process.env.GMAIL_USER);
    console.log('\nNext step: You can now send welcome emails to users! 🎉');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ ERROR: Failed to send email\n');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

testEmail();
