/**
 * Goal Notifications Tests
 * Tests for goal-related notification flow
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

let testGoalId: string | null = null;

async function testGoalCreationWithNotifications() {
  await runTest('Create goal with notifications enabled', async () => {
    const token = await getTestUserToken();
    
    const goalData = {
      type: 'SKILL_IMPROVEMENT',
      description: 'Improve serve accuracy',
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      enableNotifications: true,
      notificationFrequency: 'DAILY',
      notificationTime: '09:00'
    };
    
    const response = await fetch(`${API_BASE}/api/goals`, {
      method: 'POST',
      headers: {
        'Cookie': `next-auth.session-token=${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(goalData)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create goal: ${response.statusText}`);
    }
    
    const data = await response.json();
    testGoalId = data.goal?.id;
    
    if (!testGoalId) {
      throw new Error('Goal was not created');
    }
    
    // Verify notification was scheduled
    const notificationsResponse = await fetch(`${API_BASE}/api/notifications/scheduled`, {
      headers: {
        'Cookie': `next-auth.session-token=${token}`
      }
    });
    
    const notificationsData = await notificationsResponse.json();
    
    const goalNotification = notificationsData.notifications?.find(
      (n: any) => n.category === 'GOALS' && n.data?.goalId === testGoalId
    );
    
    if (!goalNotification) {
      throw new Error('Goal notification was not scheduled');
    }
  });
}

async function testImmediateConfirmationEmail() {
  await runTest('Immediate confirmation email sent', async () => {
    if (!testGoalId) {
      throw new Error('No test goal available');
    }
    
    const user = await prisma.user.findFirst({
      where: { email: { contains: 'test' } }
    });
    
    if (!user) throw new Error('Test user not found');
    
    // Check notification history for confirmation email
    const history = await prisma.notificationHistory.findFirst({
      where: {
        userId: user.id,
        category: 'GOALS',
        type: 'goal_created'
      },
      orderBy: { sentAt: 'desc' }
    });
    
    if (!history) {
      throw new Error('Confirmation email not found in history');
    }
    
    if (history.deliveryMethod !== 'EMAIL') {
      throw new Error('Confirmation was not sent via email');
    }
  });
}

async function testDailyReminderSetup() {
  await runTest('Daily reminder properly configured', async () => {
    if (!testGoalId) {
      throw new Error('No test goal available');
    }
    
    const user = await prisma.user.findFirst({
      where: { email: { contains: 'test' } }
    });
    
    if (!user) throw new Error('Test user not found');
    
    // Find scheduled daily notifications
    const scheduled = await prisma.scheduledNotification.findMany({
      where: {
        userId: user.id,
        category: 'GOALS',
        status: 'PENDING'
      }
    });
    
    if (scheduled.length === 0) {
      throw new Error('No daily reminders scheduled');
    }
    
    // Verify time is set correctly
    const firstReminder = scheduled[0];
    const scheduledTime = new Date(firstReminder.scheduledFor);
    
    if (scheduledTime.getHours() !== 9 || scheduledTime.getMinutes() !== 0) {
      throw new Error('Reminder time not set correctly');
    }
  });
}

async function testTipGeneration() {
  await runTest('Tips generated for all categories', async () => {
    const tipCategories = ['technique', 'strategy', 'mental', 'physical', 'practice'];
    
    // Test tip generation endpoint
    const token = await getTestUserToken();
    
    for (const category of tipCategories) {
      const response = await fetch(
        `${API_BASE}/api/notifications/generate-tip?category=${category}`,
        {
          headers: {
            'Cookie': `next-auth.session-token=${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Tip generation failed for category: ${category}`);
      }
      
      const data = await response.json();
      
      if (!data.tip || !data.tip.content) {
        throw new Error(`No tip content for category: ${category}`);
      }
    }
  });
}

async function testMilestoneAchievement() {
  await runTest('Milestone achievement email', async () => {
    if (!testGoalId) {
      throw new Error('No test goal available');
    }
    
    const token = await getTestUserToken();
    
    // Update goal progress to trigger milestone
    const response = await fetch(`${API_BASE}/api/goals/${testGoalId}`, {
      method: 'PUT',
      headers: {
        'Cookie': `next-auth.session-token=${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ progress: 50 })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update goal progress: ${response.statusText}`);
    }
    
    // Check if milestone notification was created
    const notificationsResponse = await fetch(`${API_BASE}/api/notifications/scheduled`, {
      headers: {
        'Cookie': `next-auth.session-token=${token}`
      }
    });
    
    const notificationsData = await notificationsResponse.json();
    
    const milestoneNotification = notificationsData.notifications?.find(
      (n: any) => n.type === 'goal_milestone' && n.data?.goalId === testGoalId
    );
    
    if (!milestoneNotification) {
      throw new Error('Milestone notification was not created');
    }
  });
}

async function testGoalCompletion() {
  await runTest('Goal completion flow', async () => {
    if (!testGoalId) {
      throw new Error('No test goal available');
    }
    
    const token = await getTestUserToken();
    
    // Mark goal as completed
    const response = await fetch(`${API_BASE}/api/goals/${testGoalId}`, {
      method: 'PUT',
      headers: {
        'Cookie': `next-auth.session-token=${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'COMPLETED' })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to complete goal: ${response.statusText}`);
    }
    
    // Verify completion notification
    const notificationsResponse = await fetch(`${API_BASE}/api/notifications/history`, {
      headers: {
        'Cookie': `next-auth.session-token=${token}`
      }
    });
    
    const notificationsData = await notificationsResponse.json();
    
    const completionNotification = notificationsData.history?.find(
      (n: any) => n.type === 'goal_completed' && n.data?.goalId === testGoalId
    );
    
    if (!completionNotification) {
      throw new Error('Completion notification was not sent');
    }
  });
}

async function testNotificationCancellation() {
  await runTest('Cancel notifications when goal deleted', async () => {
    if (!testGoalId) {
      throw new Error('No test goal available');
    }
    
    const token = await getTestUserToken();
    
    // Delete the goal
    const response = await fetch(`${API_BASE}/api/goals/${testGoalId}`, {
      method: 'DELETE',
      headers: {
        'Cookie': `next-auth.session-token=${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete goal: ${response.statusText}`);
    }
    
    // Verify notifications were cancelled
    const user = await prisma.user.findFirst({
      where: { email: { contains: 'test' } }
    });
    
    if (!user) throw new Error('Test user not found');
    
    const remainingNotifications = await prisma.scheduledNotification.findMany({
      where: {
        userId: user.id,
        data: {
          path: ['goalId'],
          equals: testGoalId
        },
        status: 'PENDING'
      }
    });
    
    if (remainingNotifications.length > 0) {
      throw new Error('Notifications were not cancelled');
    }
    
    testGoalId = null;
  });
}

// Run all tests
export async function runGoalNotificationsTests(): Promise<TestResult[]> {
  console.log('\n🧪 Running Goal Notifications Tests...\n');
  
  await testGoalCreationWithNotifications();
  await testImmediateConfirmationEmail();
  await testDailyReminderSetup();
  await testTipGeneration();
  await testMilestoneAchievement();
  await testGoalCompletion();
  await testNotificationCancellation();
  
  await prisma.$disconnect();
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  console.log(`\n📊 Goal Notifications Tests: ${passed} passed, ${failed} failed\n`);
  
  return results;
}

if (require.main === module) {
  runGoalNotificationsTests()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
