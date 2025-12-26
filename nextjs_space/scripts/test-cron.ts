/**
 * Test script for cron jobs
 * Usage: npx tsx scripts/test-cron.ts [endpoint]
 * 
 * Examples:
 *   npx tsx scripts/test-cron.ts notifications
 *   npx tsx scripts/test-cron.ts goals
 *   npx tsx scripts/test-cron.ts all
 */

import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const CRON_SECRET = process.env.CRON_SECRET || 'dev-secret-key';
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface CronTestResult {
  endpoint: string;
  success: boolean;
  statusCode: number;
  executionTime: number;
  response?: any;
  error?: string;
}

/**
 * Test a cron endpoint
 */
async function testCronEndpoint(endpoint: string): Promise<CronTestResult> {
  const startTime = Date.now();
  const url = `${BASE_URL}/api/cron/${endpoint}`;
  
  console.log(`\n🧪 Testing: ${url}`);
  console.log(`   Using secret: ${CRON_SECRET.substring(0, 10)}...`);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json',
      },
    });

    const executionTime = Date.now() - startTime;
    const data = await response.json();

    const result: CronTestResult = {
      endpoint,
      success: response.ok,
      statusCode: response.status,
      executionTime,
      response: data,
    };

    if (response.ok) {
      console.log(`   ✅ Success (${response.status})`);
      console.log(`   ⏱️  Execution time: ${executionTime}ms`);
      console.log(`   📊 Response:`, JSON.stringify(data, null, 2));
    } else {
      console.log(`   ❌ Failed (${response.status})`);
      console.log(`   📊 Error:`, JSON.stringify(data, null, 2));
      result.error = data.error || data.message || 'Unknown error';
    }

    return result;
  } catch (error) {
    const executionTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    console.log(`   ❌ Network error: ${errorMessage}`);
    
    return {
      endpoint,
      success: false,
      statusCode: 0,
      executionTime,
      error: errorMessage,
    };
  }
}

/**
 * Run all cron tests
 */
async function runTests(specificEndpoint?: string) {
  console.log('\n🚀 Cron Job Testing Tool');
  console.log('========================\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`CRON_SECRET configured: ${!!process.env.CRON_SECRET}`);

  const endpoints = specificEndpoint 
    ? [specificEndpoint]
    : ['process-notifications', 'process-goal-notifications'];

  const results: CronTestResult[] = [];

  for (const endpoint of endpoints) {
    const result = await testCronEndpoint(endpoint);
    results.push(result);
    
    // Wait a bit between tests to avoid overwhelming the system
    if (endpoints.length > 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Summary
  console.log('\n\n📋 Test Summary');
  console.log('===============\n');
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  results.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    const status = result.success ? 'PASS' : 'FAIL';
    console.log(`${icon} ${result.endpoint}: ${status} (${result.statusCode}) - ${result.executionTime}ms`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  console.log(`\n🎯 Result: ${successCount}/${totalCount} tests passed\n`);

  // Exit with error code if any tests failed
  if (successCount < totalCount) {
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const endpoint = args[0];

if (endpoint && !['notifications', 'goals', 'all', 'process-notifications', 'process-goal-notifications'].includes(endpoint)) {
  console.error('❌ Invalid endpoint. Use: notifications, goals, or all');
  console.error('Usage: npx tsx scripts/test-cron.ts [notifications|goals|all]');
  process.exit(1);
}

// Map friendly names to actual endpoint names
const endpointMap: { [key: string]: string } = {
  'notifications': 'process-notifications',
  'goals': 'process-goal-notifications',
  'all': 'all',
};

const mappedEndpoint = endpoint && endpoint !== 'all' ? endpointMap[endpoint] || endpoint : undefined;

// Run tests
runTests(mappedEndpoint).catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
