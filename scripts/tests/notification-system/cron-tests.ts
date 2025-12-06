/**
 * Cron Job Tests
 * Tests for scheduled notification processing
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

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

async function testProcessPendingEndpoint() {
  await runTest('POST /api/notifications/process-pending', async () => {
    const response = await fetch(`${API_BASE}/api/notifications/process-pending`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET || 'your-secret-key'}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Process pending failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.hasOwnProperty('processed')) {
      throw new Error('Response missing processed count');
    }
  });
}

async function testDailyDigestEndpoint() {
  await runTest('POST /api/notifications/send-daily-digest', async () => {
    const response = await fetch(`${API_BASE}/api/notifications/send-daily-digest`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET || 'your-secret-key'}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Daily digest failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.hasOwnProperty('sent')) {
      throw new Error('Response missing sent count');
    }
  });
}

async function testCronAuthenticationRequired() {
  await runTest('Cron endpoints require authentication', async () => {
    // Test without auth header
    const response = await fetch(`${API_BASE}/api/notifications/process-pending`, {
      method: 'POST'
    });
    
    if (response.status !== 401) {
      throw new Error('Endpoint should return 401 without authentication');
    }
  });
}

async function testCronAuthenticationInvalid() {
  await runTest('Cron endpoints reject invalid token', async () => {
    const response = await fetch(`${API_BASE}/api/notifications/process-pending`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer invalid-token-123'
      }
    });
    
    if (response.status !== 401) {
      throw new Error('Endpoint should return 401 with invalid token');
    }
  });
}

async function testScheduledNotificationProcessing() {
  await runTest('Process scheduled notifications', async () => {
    const user = await prisma.user.findFirst({
      where: { email: { contains: 'test' } }
    });
    
    if (!user) throw new Error('Test user not found');
    
    // Create a scheduled notification for processing
    const notification = await prisma.scheduledNotification.create({
      data: {
        userId: user.id,
        category: 'GOALS',
        type: 'test_notification',
        title: 'Test Notification',
        message: 'This is a test notification',
        scheduledFor: new Date(Date.now() - 1000), // Schedule in the past
        deliveryMethod: 'EMAIL',
        status: 'PENDING'
      }
    });
    
    // Process pending notifications
    const response = await fetch(`${API_BASE}/api/notifications/process-pending`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET || 'your-secret-key'}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Process pending failed: ${response.statusText}`);
    }
    
    // Verify notification was processed
    const updatedNotification = await prisma.scheduledNotification.findUnique({
      where: { id: notification.id }
    });
    
    if (!updatedNotification || updatedNotification.status !== 'SENT') {
      throw new Error('Notification was not processed');
    }
    
    // Cleanup
    await prisma.scheduledNotification.delete({ where: { id: notification.id } });
  });
}

async function testFailedNotificationRetry() {
  await runTest('Failed notifications are retried', async () => {
    const user = await prisma.user.findFirst({
      where: { email: { contains: 'test' } }
    });
    
    if (!user) throw new Error('Test user not found');
    
    // Create a failed notification
    const notification = await prisma.scheduledNotification.create({
      data: {
        userId: user.id,
        category: 'GOALS',
        type: 'test_notification',
        title: 'Test Notification',
        message: 'This is a test notification',
        scheduledFor: new Date(Date.now() - 1000),
        deliveryMethod: 'EMAIL',
        status: 'FAILED',
        retryCount: 1
      }
    });
    
    // Process pending notifications (should retry failed ones)
    const response = await fetch(`${API_BASE}/api/notifications/process-pending`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET || 'your-secret-key'}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Process pending failed: ${response.statusText}`);
    }
    
    // Verify notification was retried
    const updatedNotification = await prisma.scheduledNotification.findUnique({
      where: { id: notification.id }
    });
    
    if (!updatedNotification) {
      throw new Error('Notification not found');
    }
    
    // Either it succeeded (SENT) or retry count increased
    if (updatedNotification.status === 'FAILED' && updatedNotification.retryCount <= 1) {
      throw new Error('Notification was not retried');
    }
    
    // Cleanup
    await prisma.scheduledNotification.delete({ where: { id: notification.id } });
  });
}

async function testMaxRetryLimit() {
  await runTest('Max retry limit respected', async () => {
    const user = await prisma.user.findFirst({
      where: { email: { contains: 'test' } }
    });
    
    if (!user) throw new Error('Test user not found');
    
    // Create a notification that has exceeded retry limit
    const notification = await prisma.scheduledNotification.create({
      data: {
        userId: user.id,
        category: 'GOALS',
        type: 'test_notification',
        title: 'Test Notification',
        message: 'This is a test notification',
        scheduledFor: new Date(Date.now() - 1000),
        deliveryMethod: 'EMAIL',
        status: 'FAILED',
        retryCount: 3 // Max retry count reached
      }
    });
    
    // Process pending notifications
    await fetch(`${API_BASE}/api/notifications/process-pending`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET || 'your-secret-key'}`
      }
    });
    
    // Verify notification was not retried (count unchanged)
    const updatedNotification = await prisma.scheduledNotification.findUnique({
      where: { id: notification.id }
    });
    
    if (!updatedNotification) {
      throw new Error('Notification not found');
    }
    
    if (updatedNotification.retryCount !== 3) {
      throw new Error('Notification was retried beyond max limit');
    }
    
    // Cleanup
    await prisma.scheduledNotification.delete({ where: { id: notification.id } });
  });
}

// Run all tests
export async function runCronTests(): Promise<TestResult[]> {
  console.log('\n🧪 Running Cron Job Tests...\n');
  
  await testProcessPendingEndpoint();
  await testDailyDigestEndpoint();
  await testCronAuthenticationRequired();
  await testCronAuthenticationInvalid();
  await testScheduledNotificationProcessing();
  await testFailedNotificationRetry();
  await testMaxRetryLimit();
  
  await prisma.$disconnect();
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  console.log(`\n📊 Cron Tests: ${passed} passed, ${failed} failed\n`);
  
  return results;
}

if (require.main === module) {
  runCronTests()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
