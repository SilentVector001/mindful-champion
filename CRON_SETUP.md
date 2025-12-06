# Vercel Cron Jobs Setup Guide

Complete guide for setting up and managing automated notification processing using Vercel Cron Jobs.

## 📋 Table of Contents

- [Overview](#overview)
- [Cron Job Configuration](#cron-job-configuration)
- [Security Setup](#security-setup)
- [Local Testing](#local-testing)
- [Admin Management](#admin-management)
- [Monitoring & Logs](#monitoring--logs)
- [Troubleshooting](#troubleshooting)
- [Alternative Platforms](#alternative-platforms)

---

## 🎯 Overview

The Mindful Champion app uses Vercel Cron Jobs to automatically process notifications every 10 minutes. Two cron jobs are configured:

1. **General Notifications** (`process-notifications`)
   - Processes scheduled email notifications
   - Handles reminder notifications
   - Sends queued notifications

2. **Goal Notifications** (`process-goal-notifications`)
   - Processes daily goal check-ins
   - Checks for overdue goals
   - Sends goal-related reminders

### How It Works

```
Every 10 minutes:
┌─────────────────┐
│  Vercel Cron    │
│  Scheduler      │
└────────┬────────┘
         │
         ├──> GET /api/cron/process-notifications
         │    (with x-vercel-cron: 1 header)
         │
         └──> GET /api/cron/process-goal-notifications
              (with x-vercel-cron: 1 header)
```

---

## ⚙️ Cron Job Configuration

### `vercel.json`

Located in project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/process-notifications",
      "schedule": "*/10 * * * *"
    },
    {
      "path": "/api/cron/process-goal-notifications",
      "schedule": "*/10 * * * *"
    }
  ]
}
```

### Schedule Format

Using standard cron syntax: `minute hour day month day-of-week`

- `*/10 * * * *` = Every 10 minutes
- `0 * * * *` = Every hour
- `0 0 * * *` = Daily at midnight
- `0 9 * * 1-5` = Weekdays at 9 AM

**Important**: Vercel Cron only runs on production deployments, not on preview or development.

---

## 🔒 Security Setup

### 1. Generate CRON_SECRET

Generate a secure random secret:

```bash
openssl rand -base64 32
```

Example output:
```
your_cron_secret_base64_here
```

### 2. Add to Environment Variables

**For Vercel:**

1. Go to your project on Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add variable:
   - **Name**: `CRON_SECRET`
   - **Value**: `[your generated secret]`
   - **Environment**: Production, Preview, Development

4. Click **Save**
5. **Redeploy** for changes to take effect

**For Local Development (.env.local):**

```bash
CRON_SECRET=your_cron_secret_base64_here
```

### 3. How Security Works

Each cron endpoint checks for authentication in two ways:

1. **Vercel Cron** (production):
   - Vercel automatically adds `x-vercel-cron: 1` header
   - No CRON_SECRET needed (Vercel handles authentication)

2. **Manual/Testing** (local or admin trigger):
   - Requires `Authorization: Bearer [CRON_SECRET]` header
   - Used for local testing and admin manual triggers

```typescript
// Security check in cron endpoints
const vercelCronHeader = request.headers.get('x-vercel-cron');
const authHeader = request.headers.get('authorization');

const isVercelCron = vercelCronHeader === '1';
const hasValidAuth = authHeader === `Bearer ${CRON_SECRET}`;

if (!isVercelCron && !hasValidAuth) {
  return 401 Unauthorized
}
```

---

## 🧪 Local Testing

### Test Script

Use the provided test script to verify cron jobs locally:

```bash
# Test notifications cron
npx tsx scripts/test-cron.ts notifications

# Test goal notifications cron
npx tsx scripts/test-cron.ts goals

# Test all cron jobs
npx tsx scripts/test-cron.ts all
```

### Manual Testing with curl

```bash
# Set your CRON_SECRET
CRON_SECRET="your_cron_secret_base64_here"

# Test notifications endpoint
curl -X GET http://localhost:3000/api/cron/process-notifications \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json"

# Test goal notifications endpoint
curl -X GET http://localhost:3000/api/cron/process-goal-notifications \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json"
```

### Expected Response

```json
{
  "success": true,
  "message": "Notifications processed successfully",
  "executionTime": "1234ms",
  "timestamp": "2025-12-03T10:30:00.000Z",
  "result": {
    "processed": 5,
    "sent": 4,
    "failed": 1
  }
}
```

---

## 👨‍💼 Admin Management

### Manual Trigger Endpoint

Admins can manually trigger cron jobs through the API:

**Endpoint**: `POST /api/admin/trigger-cron`

**Authentication**: Admin role required

**Request Body**:
```json
{
  "job": "notifications"  // or "goals" or "all"
}
```

**Example Request**:
```bash
curl -X POST http://localhost:3000/api/admin/trigger-cron \
  -H "Content-Type: application/json" \
  -H "Cookie: [admin session cookie]" \
  -d '{"job": "all"}'
```

**Response**:
```json
{
  "success": true,
  "message": "Triggered 2 cron job(s)",
  "triggeredBy": "admin@mindfulchampion.com",
  "timestamp": "2025-12-03T10:30:00.000Z",
  "results": [
    {
      "job": "process-notifications",
      "success": true,
      "status": 200,
      "executionTime": "1234ms",
      "response": { ... }
    },
    {
      "job": "process-goal-notifications",
      "success": true,
      "status": 200,
      "executionTime": "987ms",
      "response": { ... }
    }
  ]
}
```

### Check Cron Status

**Endpoint**: `GET /api/admin/trigger-cron`

**Response**:
```json
{
  "cronJobs": [
    {
      "name": "process-notifications",
      "schedule": "*/10 * * * *",
      "description": "Process scheduled notifications",
      "endpoint": "/api/cron/process-notifications"
    },
    {
      "name": "process-goal-notifications",
      "schedule": "*/10 * * * *",
      "description": "Process goal notifications and check-ins",
      "endpoint": "/api/cron/process-goal-notifications"
    }
  ],
  "cronSecretConfigured": true,
  "vercelCronEnabled": true
}
```

---

## 📊 Monitoring & Logs

### Console Logs

Each cron execution logs detailed information:

```
[CRON] Starting notification processing...
  source: Vercel Cron
  timestamp: 2025-12-03T10:30:00.000Z

[CRON] Notification processing completed
  executionTime: 1234ms
  timestamp: 2025-12-03T10:30:15.000Z
```

### Viewing Logs on Vercel

1. Go to Vercel Dashboard → Your Project
2. Click **Logs** tab
3. Filter by `[CRON]` to see only cron-related logs
4. Check for:
   - Execution start/end
   - Execution time
   - Success/failure status
   - Number of notifications processed
   - Any errors

### Key Metrics to Monitor

- **Execution Time**: Should typically be < 5 seconds
- **Success Rate**: Should be > 95%
- **Notifications Processed**: Track daily/weekly totals
- **Error Rate**: Monitor for recurring errors

---

## 🐛 Troubleshooting

### Cron Jobs Not Running

**Check 1: Deployment**
```bash
# Cron jobs only work on production
# Verify you're deployed to production
```

**Check 2: vercel.json**
```bash
# Ensure vercel.json is in project root
# Verify JSON syntax is valid
cat vercel.json
```

**Check 3: Environment Variables**
```bash
# On Vercel Dashboard, check CRON_SECRET is set
# Verify it's enabled for "Production" environment
```

### Unauthorized Errors (401)

**Local Testing:**
```bash
# Verify CRON_SECRET in .env.local matches test script
echo $CRON_SECRET
```

**Production:**
```bash
# Check Vercel environment variables
# Redeploy after adding CRON_SECRET
```

### Cron Execution Failures (500)

**Check Logs:**
1. Vercel Dashboard → Logs
2. Look for error messages
3. Check database connection
4. Verify Gmail/email configuration

**Common Issues:**
- Gmail credentials expired
- Database connection timeout
- Notification service errors

### Testing Locally

```bash
# Start local server
npm run dev

# In another terminal, run test
npx tsx scripts/test-cron.ts all

# Check for success/failure messages
```

---

## 🔄 Rate Limiting

### Gmail Sending Limits

**Free Gmail Account:**
- **500 emails per day**
- ~20 emails per minute recommended

**Google Workspace:**
- **2000 emails per day**
- ~40 emails per minute recommended

### Implemented Safeguards

1. **Batch Processing**: Notifications are processed in batches
2. **Delays**: Small delays between email sends to avoid rate limits
3. **Error Handling**: Failed emails don't stop processing
4. **Retry Logic**: Failed sends can be retried on next cron run

### Monitoring Usage

```sql
-- Check daily email volume
SELECT 
  DATE(sentAt) as date,
  COUNT(*) as emails_sent
FROM ScheduledNotification
WHERE status = 'SENT'
  AND sentAt >= NOW() - INTERVAL '7 days'
GROUP BY DATE(sentAt)
ORDER BY date DESC;
```

---

## 🚀 Alternative Platforms

If not using Vercel, here are alternative solutions:

### AWS EventBridge

```yaml
Resources:
  NotificationsCron:
    Type: AWS::Events::Rule
    Properties:
      ScheduleExpression: rate(10 minutes)
      Targets:
        - Arn: !GetAtt YourLambdaFunction.Arn
          Input: |
            {
              "endpoint": "/api/cron/process-notifications"
            }
```

### GitHub Actions

```yaml
name: Cron Jobs
on:
  schedule:
    - cron: '*/10 * * * *'

jobs:
  run-cron:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger notifications cron
        run: |
          curl -X GET https://your-app.com/api/cron/process-notifications \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

### Netlify Functions (Scheduled)

```javascript
// netlify/functions/scheduled-cron.js
exports.handler = async (event, context) => {
  const response = await fetch('https://your-app.com/api/cron/process-notifications', {
    headers: {
      'Authorization': `Bearer ${process.env.CRON_SECRET}`
    }
  });
  
  return {
    statusCode: 200,
    body: JSON.stringify(await response.json())
  };
};
```

---

## ✅ Testing Checklist

Before deploying to production:

- [ ] `vercel.json` created with correct syntax
- [ ] CRON_SECRET generated and added to Vercel environment variables
- [ ] CRON_SECRET added to `.env.local` for local testing
- [ ] Test script runs successfully: `npx tsx scripts/test-cron.ts all`
- [ ] Both cron endpoints respond with 200 status
- [ ] Logs show `[CRON]` prefixed messages
- [ ] Error handling tested (invalid auth returns 401)
- [ ] Admin trigger endpoint tested
- [ ] Documentation reviewed
- [ ] Deployed to Vercel production
- [ ] Verified cron jobs run automatically (check logs after 10 minutes)

---

## 📝 Summary

✅ **Cron jobs configured** to run every 10 minutes  
✅ **Security implemented** with CRON_SECRET and Vercel headers  
✅ **Testing tools created** for local development  
✅ **Admin controls** for manual triggering  
✅ **Monitoring** via structured logs  
✅ **Error handling** for resilience  
✅ **Documentation** complete  

Your notification system is now automated and production-ready! 🎉

---

## 🆘 Support

For issues or questions:
- Check Vercel Dashboard → Logs
- Review error messages in console
- Test locally with `npx tsx scripts/test-cron.ts all`
- Use admin trigger endpoint to manually test
- Check Gmail credentials if email sending fails

**Need Help?**
- Vercel Cron Docs: https://vercel.com/docs/cron-jobs
- Contact: support@mindfulchampion.com
