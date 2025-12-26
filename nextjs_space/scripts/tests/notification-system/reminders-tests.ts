/**
 * Reminders Dashboard Tests
 * Tests for reminders CRUD operations
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

async function getTestUserToken(): Promise<string> {
  const user = await prisma.user.findFirst({
    where: { email: { contains: 'test' } }
  });
  
  if (!user) {
    throw new Error('Test user not found');
  }
  
  return 'test-session-token';
}

let testReminderId: string | null = null;

async function testCreateReminder() {
  await runTest('POST /api/notifications/reminders - create reminder', async () => {
    const token = await getTestUserToken();
    
    const reminderData = {
      title: 'Practice serves',
      message: 'Time to work on your serve technique',
      scheduledFor: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      category: 'GOALS',
      deliveryMethod: 'EMAIL',
      isActive: true
    };
    
    const response = await fetch(`${API_BASE}/api/notifications/reminders`, {
      method: 'POST',
      headers: {
        'Cookie': `next-auth.session-token=${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reminderData)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create reminder: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.reminder || !data.reminder.id) {
      throw new Error('Reminder was not created');
    }
    
    testReminderId = data.reminder.id;
  });
}

async function testGetReminders() {
  await runTest('GET /api/notifications/reminders - fetch reminders', async () => {
    const token = await getTestUserToken();
    
    const response = await fetch(`${API_BASE}/api/notifications/reminders`, {
      headers: {
        'Cookie': `next-auth.session-token=${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch reminders: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data.reminders)) {
      throw new Error('Reminders response is not an array');
    }
    
    if (testReminderId && !data.reminders.find((r: any) => r.id === testReminderId)) {
      throw new Error('Created reminder not found in list');
    }
  });
}

async function testUpdateReminder() {
  await runTest('PUT /api/notifications/reminders/[id] - update reminder', async () => {
    if (!testReminderId) {
      throw new Error('No reminder ID available for update test');
    }
    
    const token = await getTestUserToken();
    
    const updateData = {
      title: 'Updated: Practice serves',
      isActive: false
    };
    
    const response = await fetch(`${API_BASE}/api/notifications/reminders/${testReminderId}`, {
      method: 'PUT',
      headers: {
        'Cookie': `next-auth.session-token=${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update reminder: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.reminder.title !== 'Updated: Practice serves') {
      throw new Error('Reminder title was not updated');
    }
    
    if (data.reminder.isActive !== false) {
      throw new Error('Reminder active status was not updated');
    }
  });
}

async function testGetScheduled() {
  await runTest('GET /api/notifications/scheduled - get upcoming reminders', async () => {
    const token = await getTestUserToken();
    
    const response = await fetch(`${API_BASE}/api/notifications/scheduled?hours=24`, {
      headers: {
        'Cookie': `next-auth.session-token=${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch scheduled: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data.notifications)) {
      throw new Error('Scheduled notifications response is not an array');
    }
  });
}

async function testGetHistory() {
  await runTest('GET /api/notifications/history - fetch notification history', async () => {
    const token = await getTestUserToken();
    
    const response = await fetch(`${API_BASE}/api/notifications/history?limit=10`, {
      headers: {
        'Cookie': `next-auth.session-token=${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch history: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data.history)) {
      throw new Error('History response is not an array');
    }
  });
}

async function testDeleteReminder() {
  await runTest('DELETE /api/notifications/reminders/[id] - delete reminder', async () => {
    if (!testReminderId) {
      throw new Error('No reminder ID available for delete test');
    }
    
    const token = await getTestUserToken();
    
    const response = await fetch(`${API_BASE}/api/notifications/reminders/${testReminderId}`, {
      method: 'DELETE',
      headers: {
        'Cookie': `next-auth.session-token=${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete reminder: ${response.statusText}`);
    }
    
    // Verify deletion
    const verifyResponse = await fetch(`${API_BASE}/api/notifications/reminders`, {
      headers: {
        'Cookie': `next-auth.session-token=${token}`
      }
    });
    
    const data = await verifyResponse.json();
    
    if (data.reminders.find((r: any) => r.id === testReminderId)) {
      throw new Error('Reminder was not deleted');
    }
  });
}

// Run all tests
export async function runRemindersTests(): Promise<TestResult[]> {
  console.log('\n🧪 Running Reminders Dashboard Tests...\n');
  
  await testCreateReminder();
  await testGetReminders();
  await testUpdateReminder();
  await testGetScheduled();
  await testGetHistory();
  await testDeleteReminder();
  
  await prisma.$disconnect();
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  console.log(`\n📊 Reminders Tests: ${passed} passed, ${failed} failed\n`);
  
  return results;
}

if (require.main === module) {
  runRemindersTests()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
