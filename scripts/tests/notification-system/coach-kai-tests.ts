/**
 * Coach Kai Reminder Integration Tests
 * Tests for natural language reminder parsing
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
  return 'test-session-token';
}

// Test natural language reminder patterns
const testPatterns = [
  {
    input: 'Remind me to practice serves tomorrow at 3 PM',
    expectedCategory: 'GOALS',
    shouldContainTitle: 'practice serves'
  },
  {
    input: 'Set a daily reminder at 8 AM',
    expectedCategory: 'COACH_KAI',
    shouldContainTime: '08:00'
  },
  {
    input: 'I want to be notified every Monday',
    expectedCategory: 'GOALS',
    shouldContainFrequency: 'WEEKLY'
  },
  {
    input: 'Daily motivation at 7 AM please',
    expectedCategory: 'COACH_KAI',
    shouldContainTime: '07:00'
  }
];

async function testReminderParsing() {
  for (const pattern of testPatterns) {
    await runTest(`Parse: "${pattern.input}"`, async () => {
      const token = await getTestUserToken();
      
      // Send to Coach Kai API
      const response = await fetch(`${API_BASE}/api/ai-coach`, {
        method: 'POST',
        headers: {
          'Cookie': `next-auth.session-token=${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: pattern.input })
      });
      
      if (!response.ok) {
        throw new Error(`Coach Kai API failed: ${response.statusText}`);
      }
      
      // Check if a reminder was created
      const remindersResponse = await fetch(`${API_BASE}/api/notifications/reminders`, {
        headers: {
          'Cookie': `next-auth.session-token=${token}`
        }
      });
      
      const remindersData = await remindersResponse.json();
      
      // Find the most recently created reminder
      const reminder = remindersData.reminders?.sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];
      
      if (!reminder) {
        throw new Error('No reminder was created');
      }
      
      // Validate expected properties
      if (pattern.expectedCategory && reminder.category !== pattern.expectedCategory) {
        throw new Error(`Expected category ${pattern.expectedCategory}, got ${reminder.category}`);
      }
      
      if (pattern.shouldContainTitle && !reminder.title.toLowerCase().includes(pattern.shouldContainTitle.toLowerCase())) {
        throw new Error(`Title should contain "${pattern.shouldContainTitle}"`);
      }
      
      // Clean up
      await fetch(`${API_BASE}/api/notifications/reminders/${reminder.id}`, {
        method: 'DELETE',
        headers: {
          'Cookie': `next-auth.session-token=${token}`
        }
      });
    });
  }
}

async function testConfirmationMessage() {
  await runTest('Confirmation message in Coach Kai response', async () => {
    const token = await getTestUserToken();
    
    const response = await fetch(`${API_BASE}/api/ai-coach`, {
      method: 'POST',
      headers: {
        'Cookie': `next-auth.session-token=${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: 'Remind me to practice tomorrow' })
    });
    
    if (!response.ok) {
      throw new Error(`Coach Kai API failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Check if response contains confirmation
    if (!data.message || !data.message.toLowerCase().includes('reminder')) {
      throw new Error('Response does not contain reminder confirmation');
    }
  });
}

async function testAmbiguousTime() {
  await runTest('Handle ambiguous time expressions', async () => {
    const token = await getTestUserToken();
    
    const response = await fetch(`${API_BASE}/api/ai-coach`, {
      method: 'POST',
      headers: {
        'Cookie': `next-auth.session-token=${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: 'Remind me later' })
    });
    
    if (!response.ok) {
      throw new Error(`Coach Kai API failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Should ask for clarification
    if (!data.message || !data.message.toLowerCase().includes('when')) {
      throw new Error('Should ask for time clarification');
    }
  });
}

async function testLinkToDashboard() {
  await runTest('Response includes link to reminders dashboard', async () => {
    const token = await getTestUserToken();
    
    const response = await fetch(`${API_BASE}/api/ai-coach`, {
      method: 'POST',
      headers: {
        'Cookie': `next-auth.session-token=${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: 'Show my reminders' })
    });
    
    if (!response.ok) {
      throw new Error(`Coach Kai API failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.message || !data.message.includes('/dashboard/reminders')) {
      throw new Error('Response does not include dashboard link');
    }
  });
}

// Run all tests
export async function runCoachKaiTests(): Promise<TestResult[]> {
  console.log('\n🧪 Running Coach Kai Integration Tests...\n');
  
  await testReminderParsing();
  await testConfirmationMessage();
  await testAmbiguousTime();
  await testLinkToDashboard();
  
  await prisma.$disconnect();
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  console.log(`\n📊 Coach Kai Tests: ${passed} passed, ${failed} failed\n`);
  
  return results;
}

if (require.main === module) {
  runCoachKaiTests()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
