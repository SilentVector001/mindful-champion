/**
 * Integration Tests
 * End-to-end tests for the notification system
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

async function testFullUserOnboarding() {
  await runTest('E2E: New user onboarding with notifications', async () => {
    const token = await getTestUserToken();
    
    // 1. Check default preferences are created
    const prefsResponse = await fetch(`${API_BASE}/api/notifications/preferences`, {
      headers: {
        'Cookie': `next-auth.session-token=${token}`
      }
    });
    
    if (!prefsResponse.ok) {
      throw new Error('Failed to fetch preferences');
    }
    
    const prefsData = await prefsResponse.json();
    
    // Verify all categories exist
    const expectedCategories = ['GOALS', 'VIDEO_ANALYSIS', 'TOURNAMENTS', 'MEDIA', 'ACCOUNT', 'ACHIEVEMENTS', 'COACH_KAI'];
    for (const category of expectedCategories) {
      if (!prefsData.preferences[category]) {
        throw new Error(`Missing category: ${category}`);
      }
    }
    
    // 2. User creates first goal
    const goalResponse = await fetch(`${API_BASE}/api/goals`, {
      method: 'POST',
      headers: {
        'Cookie': `next-auth.session-token=${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'SKILL_IMPROVEMENT',
        description: 'Improve backhand',
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        enableNotifications: true,
        notificationFrequency: 'DAILY'
      })
    });
    
    if (!goalResponse.ok) {
      throw new Error('Failed to create goal');
    }
    
    // 3. Verify notification was scheduled
    const scheduledResponse = await fetch(`${API_BASE}/api/notifications/scheduled`, {
      headers: {
        'Cookie': `next-auth.session-token=${token}`
      }
    });
    
    const scheduledData = await scheduledResponse.json();
    
    if (!scheduledData.notifications || scheduledData.notifications.length === 0) {
      throw new Error('No notifications scheduled after goal creation');
    }
  });
}

async function testMultipleGoalsWorkflow() {
  await runTest('E2E: Multiple goals with different frequencies', async () => {
    const token = await getTestUserToken();
    
    const goals = [
      {
        type: 'SKILL_IMPROVEMENT',
        description: 'Improve serve',
        enableNotifications: true,
        notificationFrequency: 'DAILY'
      },
      {
        type: 'TOURNAMENT',
        description: 'Win local tournament',
        enableNotifications: true,
        notificationFrequency: 'WEEKLY'
      }
    ];
    
    const createdGoalIds: string[] = [];
    
    // Create all goals
    for (const goalData of goals) {
      const response = await fetch(`${API_BASE}/api/goals`, {
        method: 'POST',
        headers: {
          'Cookie': `next-auth.session-token=${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...goalData,
          targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create goal: ${goalData.description}`);
      }
      
      const data = await response.json();
      createdGoalIds.push(data.goal.id);
    }
    
    // Verify different notification frequencies
    const scheduledResponse = await fetch(`${API_BASE}/api/notifications/scheduled`, {
      headers: {
        'Cookie': `next-auth.session-token=${token}`
      }
    });
    
    const scheduledData = await scheduledResponse.json();
    
    // Should have notifications for both goals
    const notifications = scheduledData.notifications || [];
    
    if (notifications.length < 2) {
      throw new Error('Expected notifications for multiple goals');
    }
    
    // Cleanup
    for (const goalId of createdGoalIds) {
      await fetch(`${API_BASE}/api/goals/${goalId}`, {
        method: 'DELETE',
        headers: {
          'Cookie': `next-auth.session-token=${token}`
        }
      });
    }
  });
}

async function testPreferencesUpdateFlow() {
  await runTest('E2E: Update preferences and verify changes', async () => {
    const token = await getTestUserToken();
    
    // 1. Update preferences
    const updateResponse = await fetch(`${API_BASE}/api/notifications/preferences`, {
      method: 'PUT',
      headers: {
        'Cookie': `next-auth.session-token=${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        GOALS: {
          emailEnabled: false,
          pushEnabled: true,
          inAppEnabled: true
        }
      })
    });
    
    if (!updateResponse.ok) {
      throw new Error('Failed to update preferences');
    }
    
    // 2. Fetch preferences to verify
    const fetchResponse = await fetch(`${API_BASE}/api/notifications/preferences`, {
      headers: {
        'Cookie': `next-auth.session-token=${token}`
      }
    });
    
    const data = await fetchResponse.json();
    
    if (data.preferences.GOALS.emailEnabled !== false) {
      throw new Error('Email preference not updated');
    }
    
    if (data.preferences.GOALS.pushEnabled !== true) {
      throw new Error('Push preference not updated');
    }
  });
}

async function testCoachKaiReminderFlow() {
  await runTest('E2E: Ask Coach Kai to set reminder', async () => {
    const token = await getTestUserToken();
    
    // 1. Ask Coach Kai to set a reminder
    const coachResponse = await fetch(`${API_BASE}/api/ai-coach`, {
      method: 'POST',
      headers: {
        'Cookie': `next-auth.session-token=${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Remind me to practice serves tomorrow at 3 PM'
      })
    });
    
    if (!coachResponse.ok) {
      throw new Error('Coach Kai request failed');
    }
    
    // 2. Check reminders were created
    const remindersResponse = await fetch(`${API_BASE}/api/notifications/reminders`, {
      headers: {
        'Cookie': `next-auth.session-token=${token}`
      }
    });
    
    const remindersData = await remindersResponse.json();
    
    if (!remindersData.reminders || remindersData.reminders.length === 0) {
      throw new Error('No reminder created by Coach Kai');
    }
    
    // 3. Verify reminder details
    const latestReminder = remindersData.reminders[0];
    
    if (!latestReminder.title.toLowerCase().includes('practice') || 
        !latestReminder.title.toLowerCase().includes('serves')) {
      throw new Error('Reminder content does not match request');
    }
    
    // Cleanup
    await fetch(`${API_BASE}/api/notifications/reminders/${latestReminder.id}`, {
      method: 'DELETE',
      headers: {
        'Cookie': `next-auth.session-token=${token}`
      }
    });
  });
}

async function testNotificationHistoryTracking() {
  await runTest('E2E: Notification history is properly tracked', async () => {
    const token = await getTestUserToken();
    
    // Create and send a notification
    const reminderResponse = await fetch(`${API_BASE}/api/notifications/reminders`, {
      method: 'POST',
      headers: {
        'Cookie': `next-auth.session-token=${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Test History Tracking',
        message: 'This notification tests history tracking',
        scheduledFor: new Date(Date.now() + 1000).toISOString(),
        category: 'GOALS',
        deliveryMethod: 'EMAIL'
      })
    });
    
    if (!reminderResponse.ok) {
      throw new Error('Failed to create reminder');
    }
    
    const reminderData = await reminderResponse.json();
    const reminderId = reminderData.reminder.id;
    
    // Wait a moment and process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Process pending notifications
    await fetch(`${API_BASE}/api/notifications/process-pending`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET || 'your-secret-key'}`
      }
    });
    
    // Check history
    const historyResponse = await fetch(`${API_BASE}/api/notifications/history`, {
      headers: {
        'Cookie': `next-auth.session-token=${token}`
      }
    });
    
    const historyData = await historyResponse.json();
    
    if (!historyData.history || historyData.history.length === 0) {
      throw new Error('History is empty');
    }
    
    // Cleanup
    await fetch(`${API_BASE}/api/notifications/reminders/${reminderId}`, {
      method: 'DELETE',
      headers: {
        'Cookie': `next-auth.session-token=${token}`
      }
    });
  });
}

// Run all tests
export async function runIntegrationTests(): Promise<TestResult[]> {
  console.log('\n🧪 Running Integration Tests...\n');
  
  await testFullUserOnboarding();
  await testMultipleGoalsWorkflow();
  await testPreferencesUpdateFlow();
  await testCoachKaiReminderFlow();
  await testNotificationHistoryTracking();
  
  await prisma.$disconnect();
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  console.log(`\n📊 Integration Tests: ${passed} passed, ${failed} failed\n`);
  
  return results;
}

if (require.main === module) {
  runIntegrationTests()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
