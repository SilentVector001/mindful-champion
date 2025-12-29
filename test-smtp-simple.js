// Simple SMTP connection test
require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('=== SMTP Connection Test ===\n');

// Show environment variables
console.log('📋 Environment Check:');
console.log(`GMAIL_USER: ${process.env.GMAIL_USER || 'NOT SET'}`);
console.log(`GMAIL_APP_PASSWORD: ${process.env.GMAIL_APP_PASSWORD ? '***' + process.env.GMAIL_APP_PASSWORD.slice(-4) + ' (length: ' + process.env.GMAIL_APP_PASSWORD.length + ')' : 'NOT SET'}`);
console.log();

if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
  console.error('❌ Missing required environment variables!');
  process.exit(1);
}

// Create transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  debug: true, // Enable debug output
  logger: true, // Log to console
});

console.log('🔌 Testing SMTP connection...\n');

// Test the connection
transporter.verify(function (error, success) {
  if (error) {
    console.error('❌ Connection failed:');
    console.error(error);
    process.exit(1);
  } else {
    console.log('✅ SMTP server is ready to send emails!');
    console.log('📧 Sending test email...\n');
    
    // Send a simple test email
    transporter.sendMail({
      from: `"Mindful Champion Test" <${process.env.GMAIL_USER}>`,
      to: 'deansnow59@gmail.com',
      subject: '🧪 Test Email from Mindful Champion',
      text: 'This is a test email to verify the SMTP configuration is working correctly.',
      html: '<h1>Test Email</h1><p>This is a test email to verify the SMTP configuration is working correctly. ✅</p>',
    }, (err, info) => {
      if (err) {
        console.error('❌ Failed to send test email:');
        console.error(err);
        process.exit(1);
      } else {
        console.log('✅ Test email sent successfully!');
        console.log(`📝 Message ID: ${info.messageId}`);
        console.log(`📮 Response: ${info.response}`);
        console.log('\n👉 Check your inbox at deansnow59@gmail.com');
        process.exit(0);
      }
    });
  }
});
