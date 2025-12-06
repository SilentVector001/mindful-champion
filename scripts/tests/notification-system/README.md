# Notification System Test Suite

## Overview

Comprehensive testing suite for the Mindful Champion notification system. 42 tests across 7 modules covering API endpoints, integrations, and end-to-end workflows.

## Quick Start

### 1. Prerequisites

#### Database
```bash
# Verify database connection
npm run prisma:studio
```

#### Email Setup
The system requires Gmail SMTP configuration. Follow these steps:

1. **Enable 2-Factor Authentication** on your Gmail account
   - Go to https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Generate App Password**
   - Visit https://myaccount.google.com/apppasswords
   - Select "Mail" and generate a password
   - Copy the 16-character password

3. **Update .env file**
   ```bash
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=your-16-char-app-password
   NOTIFICATION_EMAIL=welcomefrommc@mindfulchampion.com
   SUPPORT_EMAIL=support@mindfulchampion.com
   PARTNERS_EMAIL=partners@mindfulchampion.com
   SPONSORS_EMAIL=sponsors@mindfulchampion.com
   ```

4. **Restart Application**
   ```bash
   npm run dev
   # OR
   npm run build && npm start
   ```

#### Test User
```bash
# Create a test user in your database
# Ensure email contains 'test' (e.g., test@example.com)
```

### 2. Running Tests

#### Run All Tests
```bash
cd scripts/tests/notification-system
npx ts-node run-all-tests.ts
```

#### Run Individual Test Suites

```bash
# Notification Preferences Tests
npx ts-node preferences-tests.ts

# Reminders Dashboard Tests
npx ts-node reminders-tests.ts

# Coach Kai Integration Tests
npx ts-node coach-kai-tests.ts

# Goal Notifications Tests
npx ts-node goal-notifications-tests.ts

# Email Delivery Tests
npx ts-node email-tests.ts

# Cron Job Tests
npx ts-node cron-tests.ts

# Integration Tests
npx ts-node integration-tests.ts
```

## Test Modules

### 1. Preferences Tests
**File**: `preferences-tests.ts`  
**Tests**: 5  
**Coverage**: Notification preferences API endpoints

- GET /api/notifications/preferences
- PUT /api/notifications/preferences
- Timezone handling
- Error handling for invalid categories
- Database update verification

### 2. Reminders Tests
**File**: `reminders-tests.ts`  
**Tests**: 6  
**Coverage**: Reminders dashboard CRUD operations

- POST /api/notifications/reminders
- GET /api/notifications/reminders
- PUT /api/notifications/reminders/[id]
- GET /api/notifications/scheduled
- GET /api/notifications/history
- DELETE /api/notifications/reminders/[id]

### 3. Coach Kai Tests
**File**: `coach-kai-tests.ts`  
**Tests**: 7  
**Coverage**: Natural language reminder parsing

- Parse various reminder patterns
- Confirmation message generation
- Handle ambiguous time expressions
- Link to reminders dashboard

### 4. Goal Notifications Tests
**File**: `goal-notifications-tests.ts`  
**Tests**: 7  
**Coverage**: Complete goal lifecycle notifications

- Goal creation with notifications
- Immediate confirmation email
- Daily reminder setup
- Tips generation
- Milestone achievement
- Goal completion
- Notification cancellation

### 5. Email Tests
**File**: `email-tests.ts`  
**Tests**: 5  
**Coverage**: Gmail SMTP and email delivery

- Gmail SMTP connection
- Email templates validation
- Multi-address sending
- HTML/plain text formatting
- Delivery verification

### 6. Cron Tests
**File**: `cron-tests.ts`  
**Tests**: 7  
**Coverage**: Scheduled notification processing

- POST /api/notifications/process-pending
- POST /api/notifications/send-daily-digest
- Authentication requirements
- Notification processing
- Retry mechanism
- Max retry limit

### 7. Integration Tests
**File**: `integration-tests.ts`  
**Tests**: 5  
**Coverage**: End-to-end user workflows

- New user onboarding
- Multiple goals workflow
- Preferences update flow
- Coach Kai reminder flow
- Notification history tracking

## Test Output

### Success Output
```
================================================================================
🧪 MINDFUL CHAMPION - NOTIFICATION SYSTEM TEST SUITE
================================================================================

Running comprehensive tests for the notification system

✅ GET /api/notifications/preferences - fetch user preferences
✅ PUT /api/notifications/preferences - update preferences
✅ Timezone handling in preferences
...

📊 TEST SUMMARY
================================================================================

1. Notification Preferences Tests
  Status: ✅ PASSED
  Passed: 5
  Failed: 0
  Duration: 1234ms
...

TOTAL RESULTS
  Tests Passed: 42
  Tests Failed: 0
  Total Duration: 15234ms
  Success Rate: 100.00%

🎉 ALL TESTS PASSED! 🎉
================================================================================
```

### Failure Output
```
❌ FAILED TESTS DETAILS
================================================================================

5. Email Delivery Tests
  ❌ Gmail SMTP connection test
     Error: Invalid login: 535-5.7.8 Username and Password not accepted
     Duration: 523ms
...
```

## Troubleshooting

### Gmail Authentication Errors

**Error**: `535-5.7.8 Username and Password not accepted`

**Solution**:
1. Enable 2-Factor Authentication
2. Generate App Password (not your regular Gmail password)
3. Use the 16-character app password in `.env`
4. Restart the application

### Database Connection Errors

**Error**: `PrismaClientInitializationError`

**Solution**:
```bash
# Check database is running
# Verify DATABASE_URL in .env
# Run migrations
npx prisma migrate deploy
```

### Test User Not Found

**Error**: `Test user not found`

**Solution**:
```bash
# Create a test user through your application
# Or use Prisma Studio
npm run prisma:studio
# Create user with email containing 'test'
```

### Application Not Running

**Error**: `fetch failed` or connection refused

**Solution**:
```bash
# Start the development server
npm run dev

# OR start production server
npm run build && npm start

# Verify it's running on http://localhost:3000
```

## Adding New Tests

### Test Template
```typescript
async function testYourFeature() {
  await runTest('Description of your test', async () => {
    // Arrange
    const token = await getTestUserToken();
    
    // Act
    const response = await fetch(`${API_BASE}/your-endpoint`, {
      method: 'POST',
      headers: {
        'Cookie': `next-auth.session-token=${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data: 'value' })
    });
    
    // Assert
    if (!response.ok) {
      throw new Error(`Test failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.expectedField) {
      throw new Error('Expected field not found');
    }
  });
}
```

### Best Practices

1. **Clean Up**: Always clean up test data
2. **Isolation**: Tests should not depend on each other
3. **Descriptive Names**: Use clear, descriptive test names
4. **Error Messages**: Provide helpful error messages
5. **Documentation**: Comment complex test logic

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Notification Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run tests
        run: cd scripts/tests/notification-system && npx ts-node run-all-tests.ts
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          GMAIL_USER: ${{ secrets.GMAIL_USER }}
          GMAIL_APP_PASSWORD: ${{ secrets.GMAIL_APP_PASSWORD }}
```

## Performance Benchmarks

Expected test execution times:

| Test Suite | Duration | Notes |
|------------|----------|-------|
| Preferences | 1-2s | Fast, database only |
| Reminders | 2-3s | Includes CRUD operations |
| Coach Kai | 3-5s | AI parsing may be slower |
| Goal Notifications | 4-6s | Multiple operations |
| Email | 5-10s | SMTP can be slow |
| Cron | 2-3s | Includes retries |
| Integration | 5-10s | Complete workflows |
| **Total** | **22-39s** | Full suite |

## Support

For issues or questions:
1. Check [TESTING_REPORT.md](../../../TESTING_REPORT.md)
2. Review [NOTIFICATION_SYSTEM.md](../../../NOTIFICATION_SYSTEM.md)
3. Contact development team

---

*Last Updated: December 3, 2025*
