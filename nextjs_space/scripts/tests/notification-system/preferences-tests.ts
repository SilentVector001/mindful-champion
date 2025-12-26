/**
 * Notification Preferences Tests
 * Tests for GET/PUT /api/notifications/preferences
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

// Test helper
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

// Get test user session token
async function getTestUserToken(): Promise<string> {
  // For now, return a placeholder - in real tests, you'd authenticate
  const user = await prisma.user.findFirst({
    where: { email: { contains: 'test' } }
  });
  
  if (!user) {
    throw new Error('Test user not found');
  }
  
  // In a real scenario, you'd call your auth endpoint to get a session token
  return 'test-session-token';
}

async function testGetPreferences() {
  await runTest('GET /api/notifications/preferences - fetch user preferences', async () => {
    const token = await getTestUserToken();
    
    const response = await fetch(`${API_BASE}/api/notifications/preferences`, {
      headers: {
        'Cookie': `next-auth.session-token=${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch preferences: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Validate response structure
    if (!data.preferences || typeof data.preferences !== 'object') {
      throw new Error('Invalid preferences response structure');
    }
    
    // Check for all expected categories
    const expectedCategories = ['GOALS', 'VIDEO_ANALYSIS', 'TOURNAMENTS', 'MEDIA', 'ACCOUNT', 'ACHIEVEMENTS', 'COACH_KAI'];
    for (const category of expectedCategories) {
      if (!data.preferences[category]) {
        throw new Error(`Missing category: ${category}`);
      }
    }
  });
}

async function testUpdatePreferences() {
  await runTest('PUT /api/notifications/preferences - update preferences', async () => {
    const token = await getTestUserToken();
    
    const updateData = {
      GOALS: {
        emailEnabled: true,
        pushEnabled: false,
        inAppEnabled: true,
        frequency: 'DAILY',
        customTimes: ['09:00']
      }
    };
    
    const response = await fetch(`${API_BASE}/api/notifications/preferences`, {
      method: 'PUT',
      headers: {
        'Cookie': `next-auth.session-token=${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update preferences: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error('Update did not return success');
    }
  });
}

async function testTimezoneHandling() {
  await runTest('Timezone handling in preferences', async () => {
    const token = await getTestUserToken();
    
    const updateData = {
      GOALS: {
        timezone: 'America/New_York',
        customTimes: ['09:00', '15:00']
      }
    };
    
    const response = await fetch(`${API_BASE}/api/notifications/preferences`, {
      method: 'PUT',
      headers: {
        'Cookie': `next-auth.session-token=${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to set timezone: ${response.statusText}`);
    }
    
    // Verify timezone was saved
    const getResponse = await fetch(`${API_BASE}/api/notifications/preferences`, {
      headers: {
        'Cookie': `next-auth.session-token=${token}`
      }
    });
    
    const data = await getResponse.json();
    
    if (data.preferences.GOALS.timezone !== 'America/New_York') {
      throw new Error('Timezone was not saved correctly');
    }
  });
}

async function testInvalidCategory() {
  await runTest('Error handling - invalid category', async () => {
    const token = await getTestUserToken();
    
    const updateData = {
      INVALID_CATEGORY: {
        emailEnabled: true
      }
    };
    
    const response = await fetch(`${API_BASE}/api/notifications/preferences`, {
      method: 'PUT',
      headers: {
        'Cookie': `next-auth.session-token=${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    // Should fail with 400
    if (response.status !== 400) {
      throw new Error('Invalid category should return 400');
    }
  });
}

async function testDatabaseUpdate() {
  await runTest('Database update verification', async () => {
    const user = await prisma.user.findFirst({
      where: { email: { contains: 'test' } }
    });
    
    if (!user) throw new Error('Test user not found');
    
    // Update via API
    const token = await getTestUserToken();
    const updateData = {
      ACHIEVEMENTS: {
        emailEnabled: true,
        frequency: 'WEEKLY'
      }
    };
    
    await fetch(`${API_BASE}/api/notifications/preferences`, {
      method: 'PUT',
      headers: {
        'Cookie': `next-auth.session-token=${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    // Verify in database
    const prefs = await prisma.notificationPreferences.findUnique({
      where: { userId: user.id }
    });
    
    if (!prefs) {
      throw new Error('Preferences not found in database');
    }
    
    const achievementsPrefs = prefs.preferences as any;
    if (achievementsPrefs.ACHIEVEMENTS?.frequency !== 'WEEKLY') {
      throw new Error('Database was not updated correctly');
    }
  });
}

// Run all tests
export async function runPreferencesTests(): Promise<TestResult[]> {
  console.log('\n🧪 Running Notification Preferences Tests...\n');
  
  await testGetPreferences();
  await testUpdatePreferences();
  await testTimezoneHandling();
  await testInvalidCategory();
  await testDatabaseUpdate();
  
  await prisma.$disconnect();
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  console.log(`\n📊 Preferences Tests: ${passed} passed, ${failed} failed\n`);
  
  return results;
}

// Run if called directly
if (require.main === module) {
  runPreferencesTests()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
