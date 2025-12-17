/**
 * Main Test Runner
 * Runs all notification system tests and generates comprehensive report
 */

import { runPreferencesTests } from './preferences-tests';
import { runRemindersTests } from './reminders-tests';
import { runCoachKaiTests } from './coach-kai-tests';
import { runGoalNotificationsTests } from './goal-notifications-tests';
import { runEmailTests } from './email-tests';
import { runCronTests } from './cron-tests';
import { runIntegrationTests } from './integration-tests';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

interface TestSuite {
  name: string;
  results: TestResult[];
  duration: number;
  passed: number;
  failed: number;
}

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function printHeader() {
  console.log('\n' + '='.repeat(80));
  console.log(`${colors.bright}${colors.cyan}🧪 MINDFUL CHAMPION - NOTIFICATION SYSTEM TEST SUITE${colors.reset}`);
  console.log('='.repeat(80) + '\n');
  console.log(`${colors.blue}Running comprehensive tests for the notification system${colors.reset}\n`);
}

function printSummary(suites: TestSuite[], totalDuration: number) {
  console.log('\n' + '='.repeat(80));
  console.log(`${colors.bright}${colors.cyan}📊 TEST SUMMARY${colors.reset}`);
  console.log('='.repeat(80) + '\n');
  
  let totalPassed = 0;
  let totalFailed = 0;
  
  suites.forEach(suite => {
    totalPassed += suite.passed;
    totalFailed += suite.failed;
    
    const status = suite.failed === 0 ? 
      `${colors.green}✅ PASSED${colors.reset}` : 
      `${colors.red}❌ FAILED${colors.reset}`;
    
    console.log(`${colors.bright}${suite.name}${colors.reset}`);
    console.log(`  Status: ${status}`);
    console.log(`  Passed: ${colors.green}${suite.passed}${colors.reset}`);
    console.log(`  Failed: ${suite.failed > 0 ? colors.red : colors.reset}${suite.failed}${colors.reset}`);
    console.log(`  Duration: ${suite.duration}ms\n`);
  });
  
  console.log('-'.repeat(80));
  console.log(`${colors.bright}TOTAL RESULTS${colors.reset}`);
  console.log(`  Tests Passed: ${colors.green}${totalPassed}${colors.reset}`);
  console.log(`  Tests Failed: ${totalFailed > 0 ? colors.red : colors.reset}${totalFailed}${colors.reset}`);
  console.log(`  Total Duration: ${totalDuration}ms`);
  console.log(`  Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(2)}%`);
  
  if (totalFailed === 0) {
    console.log(`\n${colors.green}${colors.bright}🎉 ALL TESTS PASSED! 🎉${colors.reset}\n`);
  } else {
    console.log(`\n${colors.red}${colors.bright}⚠️  SOME TESTS FAILED ⚠️${colors.reset}\n`);
  }
  
  console.log('='.repeat(80) + '\n');
}

function printFailedTests(suites: TestSuite[]) {
  const failedSuites = suites.filter(s => s.failed > 0);
  
  if (failedSuites.length === 0) {
    return;
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`${colors.bright}${colors.red}❌ FAILED TESTS DETAILS${colors.reset}`);
  console.log('='.repeat(80) + '\n');
  
  failedSuites.forEach(suite => {
    console.log(`${colors.bright}${suite.name}${colors.reset}`);
    
    const failedTests = suite.results.filter(r => !r.passed);
    
    failedTests.forEach(test => {
      console.log(`  ${colors.red}❌${colors.reset} ${test.name}`);
      console.log(`     Error: ${colors.red}${test.error}${colors.reset}`);
      console.log(`     Duration: ${test.duration}ms\n`);
    });
  });
}

async function runAllTests() {
  printHeader();
  
  const suites: TestSuite[] = [];
  const startTime = Date.now();
  
  try {
    // 1. Preferences Tests
    console.log(`${colors.magenta}Running Preferences Tests...${colors.reset}`);
    const prefsStart = Date.now();
    const prefsResults = await runPreferencesTests();
    const prefsDuration = Date.now() - prefsStart;
    suites.push({
      name: '1. Notification Preferences Tests',
      results: prefsResults,
      duration: prefsDuration,
      passed: prefsResults.filter(r => r.passed).length,
      failed: prefsResults.filter(r => !r.passed).length
    });
    
    // 2. Reminders Tests
    console.log(`${colors.magenta}Running Reminders Tests...${colors.reset}`);
    const remindersStart = Date.now();
    const remindersResults = await runRemindersTests();
    const remindersDuration = Date.now() - remindersStart;
    suites.push({
      name: '2. Reminders Dashboard Tests',
      results: remindersResults,
      duration: remindersDuration,
      passed: remindersResults.filter(r => r.passed).length,
      failed: remindersResults.filter(r => !r.passed).length
    });
    
    // 3. Coach Kai Tests
    console.log(`${colors.magenta}Running Coach Kai Tests...${colors.reset}`);
    const coachStart = Date.now();
    const coachResults = await runCoachKaiTests();
    const coachDuration = Date.now() - coachStart;
    suites.push({
      name: '3. Coach Kai Integration Tests',
      results: coachResults,
      duration: coachDuration,
      passed: coachResults.filter(r => r.passed).length,
      failed: coachResults.filter(r => !r.passed).length
    });
    
    // 4. Goal Notifications Tests
    console.log(`${colors.magenta}Running Goal Notifications Tests...${colors.reset}`);
    const goalStart = Date.now();
    const goalResults = await runGoalNotificationsTests();
    const goalDuration = Date.now() - goalStart;
    suites.push({
      name: '4. Goal Notifications Tests',
      results: goalResults,
      duration: goalDuration,
      passed: goalResults.filter(r => r.passed).length,
      failed: goalResults.filter(r => !r.passed).length
    });
    
    // 5. Email Tests
    console.log(`${colors.magenta}Running Email Tests...${colors.reset}`);
    const emailStart = Date.now();
    const emailResults = await runEmailTests();
    const emailDuration = Date.now() - emailStart;
    suites.push({
      name: '5. Email Delivery Tests',
      results: emailResults,
      duration: emailDuration,
      passed: emailResults.filter(r => r.passed).length,
      failed: emailResults.filter(r => !r.passed).length
    });
    
    // 6. Cron Tests
    console.log(`${colors.magenta}Running Cron Tests...${colors.reset}`);
    const cronStart = Date.now();
    const cronResults = await runCronTests();
    const cronDuration = Date.now() - cronStart;
    suites.push({
      name: '6. Cron Job Tests',
      results: cronResults,
      duration: cronDuration,
      passed: cronResults.filter(r => r.passed).length,
      failed: cronResults.filter(r => !r.passed).length
    });
    
    // 7. Integration Tests
    console.log(`${colors.magenta}Running Integration Tests...${colors.reset}`);
    const integrationStart = Date.now();
    const integrationResults = await runIntegrationTests();
    const integrationDuration = Date.now() - integrationStart;
    suites.push({
      name: '7. Integration Tests',
      results: integrationResults,
      duration: integrationDuration,
      passed: integrationResults.filter(r => r.passed).length,
      failed: integrationResults.filter(r => !r.passed).length
    });
    
    const totalDuration = Date.now() - startTime;
    
    // Print results
    printFailedTests(suites);
    printSummary(suites, totalDuration);
    
    // Generate report
    await generateReport(suites, totalDuration);
    
    // Exit with appropriate code
    const totalFailed = suites.reduce((sum, suite) => sum + suite.failed, 0);
    process.exit(totalFailed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error(`\n${colors.red}${colors.bright}Fatal error running tests:${colors.reset}`, error);
    process.exit(1);
  }
}

async function generateReport(suites: TestSuite[], totalDuration: number) {
  const fs = require('fs').promises;
  const path = require('path');
  
  const totalPassed = suites.reduce((sum, suite) => sum + suite.passed, 0);
  const totalFailed = suites.reduce((sum, suite) => sum + suite.failed, 0);
  const successRate = ((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(2);
  
  const report = `# Notification System Test Report

Generated: ${new Date().toLocaleString()}

## Summary

- **Total Tests**: ${totalPassed + totalFailed}
- **Passed**: ${totalPassed} ✅
- **Failed**: ${totalFailed} ❌
- **Success Rate**: ${successRate}%
- **Total Duration**: ${totalDuration}ms

## Test Suites

${suites.map(suite => `### ${suite.name}

- **Status**: ${suite.failed === 0 ? '✅ PASSED' : '❌ FAILED'}
- **Tests Passed**: ${suite.passed}
- **Tests Failed**: ${suite.failed}
- **Duration**: ${suite.duration}ms

${suite.results.map(test => {
  return test.passed 
    ? `- ✅ ${test.name} (${test.duration}ms)`
    : `- ❌ ${test.name} (${test.duration}ms)\n  - Error: ${test.error}`;
}).join('\n')}
`).join('\n')}

## Failed Tests Details

${suites.filter(s => s.failed > 0).map(suite => {
  const failedTests = suite.results.filter(r => !r.passed);
  return `### ${suite.name}

${failedTests.map(test => `#### ${test.name}

**Error**: ${test.error}

**Duration**: ${test.duration}ms
`).join('\n')}`;
}).join('\n') || 'No failed tests! 🎉'}

## Recommendations

${totalFailed > 0 ? `
⚠️ **Action Required**: ${totalFailed} test(s) failed. Please review and fix the issues above.

### Priority Issues:
${suites.filter(s => s.failed > 0).map(s => `- **${s.name}**: ${s.failed} failed test(s)`).join('\n')}
` : `
✅ **All tests passed!** The notification system is working as expected.

### Next Steps:
- Monitor production deployment
- Set up continuous testing
- Review performance metrics
`}

## Test Coverage

The test suite covers:
- ✅ Notification preferences (GET/PUT)
- ✅ Reminders dashboard (CRUD)
- ✅ Coach Kai integration
- ✅ Goal notifications flow
- ✅ Email delivery
- ✅ Cron job processing
- ✅ End-to-end integration

---

*Generated by Mindful Champion Test Suite*
`;
  
  const reportPath = path.join(process.cwd(), 'TESTING_REPORT.md');
  await fs.writeFile(reportPath, report);
  
  console.log(`\n${colors.green}📄 Test report generated: ${reportPath}${colors.reset}\n`);
}

// Run tests
if (require.main === module) {
  runAllTests();
}

export { runAllTests };
