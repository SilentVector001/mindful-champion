/**
 * Email Delivery Tests
 * Tests for Gmail SMTP email delivery
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

const results: TestResult[] = [];

async function runTest(name: string, testFn: () => Promise<void>): Promise<void> {
  const start = Date.now();
  try {
    await testFn();
    results.push({ name, passed: true, duration: Date.now() - start });
    console.log(`✅ ${name}`);
  } catch (error) {
    results.push({ 
      name, 
      passed: false, 
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - start 
    });
    console.log(`❌ ${name}: ${error instanceof Error ? error.message : error}`);
  }
}

async function testGmailConnection() {
  await runTest('Gmail SMTP connection test', async () => {
    // Check environment variables
    const requiredVars = [
      'GMAIL_USER',
      'GMAIL_APP_PASSWORD',
      'NOTIFICATION_EMAIL',
      'SUPPORT_EMAIL',
      'PARTNERS_EMAIL',
      'SPONSORS_EMAIL'
    ];
    
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        throw new Error(`Missing environment variable: ${varName}`);
      }
    }
    
    // Test basic SMTP connection (without actually sending)
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });
    
    await transporter.verify();
  });
}

async function testEmailTemplates() {
  await runTest('Email templates validation', async () => {
    const templates = [
      'goal_confirmation',
      'daily_goal_checkin',
      'milestone_achievement',
      'video_analysis_complete',
      'trial_expiring',
      'tournament_live',
      'new_media_content'
    ];
    
    // Verify all template files exist
    const fs = require('fs');
    const path = require('path');
    
    for (const template of templates) {
      const templatePath = path.join(process.cwd(), 'lib', 'email', 'templates', `${template}.ts`);
      if (!fs.existsSync(templatePath)) {
        throw new Error(`Template file missing: ${template}.ts`);
      }
    }
  });
}

async function testSendFromAllAddresses() {
  await runTest('Send test emails from all configured addresses', async () => {
    const addresses = [
      { from: process.env.NOTIFICATION_EMAIL, name: 'Notification Email' },
      { from: process.env.SUPPORT_EMAIL, name: 'Support Email' },
      { from: process.env.PARTNERS_EMAIL, name: 'Partners Email' },
      { from: process.env.SPONSORS_EMAIL, name: 'Sponsors Email' }
    ];
    
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });
    
    for (const address of addresses) {
      // Send a test email (to test address)
      const mailOptions = {
        from: address.from,
        to: process.env.GMAIL_USER, // Send to self for testing
        subject: `Test Email from ${address.name}`,
        text: `This is a test email from ${address.name}`,
        html: `<p>This is a test email from <strong>${address.name}</strong></p>`
      };
      
      await transporter.sendMail(mailOptions);
    }
  });
}

async function testEmailFormatting() {
  await runTest('HTML and plain text email formatting', async () => {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });
    
    const mailOptions = {
      from: process.env.NOTIFICATION_EMAIL,
      to: process.env.GMAIL_USER,
      subject: 'Test Email Formatting',
      text: 'This is the plain text version of the email.',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; }
              .header { background-color: #0284c7; color: white; padding: 20px; }
              .content { padding: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Test Email</h1>
            </div>
            <div class="content">
              <p>This is the HTML version of the email.</p>
              <p><strong>Bold text</strong> and <em>italic text</em> work correctly.</p>
            </div>
          </body>
        </html>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    if (!info.messageId) {
      throw new Error('Email was not sent successfully');
    }
  });
}

async function testEmailDelivery() {
  await runTest('Verify email delivery', async () => {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });
    
    const mailOptions = {
      from: process.env.NOTIFICATION_EMAIL,
      to: process.env.GMAIL_USER,
      subject: 'Delivery Test Email',
      text: 'Testing email delivery',
      html: '<p>Testing email delivery</p>'
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    // Check delivery status
    if (!info.accepted || info.accepted.length === 0) {
      throw new Error('Email was not accepted for delivery');
    }
    
    if (info.rejected && info.rejected.length > 0) {
      throw new Error(`Email was rejected: ${info.rejected.join(', ')}`);
    }
  });
}

// Run all tests
export async function runEmailTests(): Promise<TestResult[]> {
  console.log('\n🧪 Running Email Delivery Tests...\n');
  
  await testGmailConnection();
  await testEmailTemplates();
  await testSendFromAllAddresses();
  await testEmailFormatting();
  await testEmailDelivery();
  
  await prisma.$disconnect();
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  console.log(`\n📊 Email Tests: ${passed} passed, ${failed} failed\n`);
  
  return results;
}

if (require.main === module) {
  runEmailTests()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
