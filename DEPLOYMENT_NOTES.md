# Vercel Cron Deployment Checklist

## Pre-Deployment

### 1. Generate CRON_SECRET

```bash
openssl rand -base64 32
```

Copy the output, you'll need it for Vercel environment variables.

### 2. Test Locally

Ensure you have `.env.local` with:
```
CRON_SECRET=your-generated-secret-here
```

Run tests:
```bash
npm run dev

# In another terminal
npm run test:cron
```

All tests should pass (✅).

### 3. Verify Files

Check these files exist:
- ✅ `vercel.json` (cron configuration)
- ✅ `app/api/cron/process-notifications/route.ts`
- ✅ `app/api/cron/process-goal-notifications/route.ts`
- ✅ `app/api/admin/trigger-cron/route.ts`
- ✅ `scripts/test-cron.ts`
- ✅ `.env.example` (includes CRON_SECRET)

---

## Vercel Deployment

### 1. Push to Repository

```bash
git add .
git commit -m "feat: add Vercel Cron jobs for notifications"
git push origin main
```

### 2. Configure Environment Variables

In Vercel Dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add the following:

| Name | Value | Environment |
|------|-------|-------------|
| `CRON_SECRET` | [your generated secret] | Production, Preview, Development |

3. Click **Save**

### 3. Deploy

Option A: **Automatic** (if connected to Git)
- Push to `main` branch
- Vercel auto-deploys

Option B: **Manual** (using Vercel CLI)
```bash
vercel --prod
```

### 4. Verify Deployment

After deployment completes:

1. Go to **Deployments** tab
2. Click on the latest deployment
3. Verify:
   - ✅ Build successful
   - ✅ No errors in build logs
   - ✅ `vercel.json` detected

---

## Post-Deployment Verification

### 1. Check Cron Jobs Are Registered

In Vercel Dashboard:
1. Go to **Cron Jobs** tab (or **Settings** → **Cron Jobs**)
2. You should see:
   - `GET /api/cron/process-notifications` (*/10 * * * *)
   - `GET /api/cron/process-goal-notifications` (*/10 * * * *)

### 2. Wait for First Execution

Cron jobs run every 10 minutes. Wait up to 10 minutes, then check:

**View Logs:**
1. Go to **Logs** tab in Vercel Dashboard
2. Filter by `[CRON]`
3. Look for entries like:
   ```
   [CRON] Starting notification processing...
   [CRON] Notification processing completed
   ```

### 3. Manual Test (Admin)

If you don't want to wait, trigger manually:

```bash
# Get admin session token (login to your app as admin first)
# Then use browser DevTools to copy session cookie

curl -X POST https://your-app.vercel.app/api/admin/trigger-cron \
  -H "Content-Type: application/json" \
  -H "Cookie: [your session cookie]" \
  -d '{"job": "all"}'
```

Expected response:
```json
{
  "success": true,
  "message": "Triggered 2 cron job(s)",
  "triggeredBy": "admin@example.com",
  "results": [...]
}
```

### 4. Verify Notifications

Check that notifications are being processed:

1. Create a test notification (if you have the UI)
2. Set it to trigger in 1-2 minutes
3. Wait for next cron run (max 10 minutes)
4. Verify notification was sent

---

## Troubleshooting

### Cron Jobs Not Showing in Dashboard

**Cause**: `vercel.json` not detected or invalid

**Solution**:
1. Verify `vercel.json` is in project root (not in subdirectory)
2. Check JSON syntax is valid: `cat vercel.json | jq`
3. Redeploy

### Cron Jobs Not Executing

**Cause**: Only runs in production, not preview

**Solution**:
1. Ensure you deployed to **production** (not preview)
2. Check you're looking at **production** logs
3. Wait at least 10 minutes after deployment

### 401 Unauthorized Errors in Logs

**Cause**: CRON_SECRET not configured or mismatch

**Solution**:
1. Go to Vercel Dashboard → Environment Variables
2. Verify `CRON_SECRET` is set for **Production**
3. Redeploy after adding variable

### 500 Errors in Cron Execution

**Cause**: Application error (database, email, etc.)

**Solution**:
1. Check Vercel logs for specific error
2. Common issues:
   - Database connection failed → Check `DATABASE_URL`
   - Gmail auth failed → Check `GMAIL_USER` and `GMAIL_APP_PASSWORD`
   - Missing dependencies → Check `package.json`

---

## Monitoring

### Daily Checks (First Week)

Check these daily for the first week:

- [ ] Go to Vercel Dashboard → Logs
- [ ] Filter by `[CRON]`
- [ ] Verify executions every 10 minutes
- [ ] Check for errors (red text)
- [ ] Verify execution times are reasonable (< 5 seconds)
- [ ] Check email inbox for test notifications

### Weekly Checks (Ongoing)

After initial week, check weekly:

- [ ] Any 500 errors in logs
- [ ] Execution times still reasonable
- [ ] No unauthorized attempts (401 errors)
- [ ] Users receiving notifications as expected

### Alerts to Set Up (Optional)

Consider setting up alerts:

1. **Vercel Integration Monitoring**:
   - Link Slack/Discord for deployment notifications
   - Get notified of failed deployments

2. **Error Tracking** (Sentry, etc.):
   - Track 500 errors automatically
   - Get notified of cron failures

3. **Custom Monitoring**:
   - Track daily notification volume
   - Alert if cron doesn't run for 30+ minutes
   - Monitor email sending quotas

---

## Rollback Plan

If cron jobs cause issues:

### Quick Disable

**Option 1**: Remove cron configuration
```bash
# Temporarily rename vercel.json
mv vercel.json vercel.json.disabled
git commit -am "disable cron temporarily"
git push
```

**Option 2**: Redeploy previous version
```bash
# In Vercel Dashboard
# Go to Deployments → [previous working deployment]
# Click "Promote to Production"
```

### Investigate
1. Check logs for errors
2. Test locally: `npm run test:cron`
3. Verify environment variables
4. Check database/email connections

### Re-enable
```bash
# Restore vercel.json
mv vercel.json.disabled vercel.json
git commit -am "re-enable cron"
git push
```

---

## Success Metrics

Your cron jobs are working correctly when:

✅ **Execution Frequency**
- Logs show execution every 10 minutes
- No missing time periods

✅ **Success Rate**
- > 95% of executions return 200 status
- < 5% error rate acceptable

✅ **Performance**
- Execution time < 5 seconds (typical)
- < 10 seconds (acceptable)
- > 10 seconds (investigate)

✅ **Functionality**
- Users receive scheduled notifications
- Notifications sent within 10 minutes of schedule
- No duplicate notifications

✅ **Security**
- No unauthorized access attempts
- CRON_SECRET properly configured
- Logs don't expose secrets

---

## Quick Reference

### View Logs
```
Vercel Dashboard → Logs → Filter: [CRON]
```

### Test Locally
```bash
npm run test:cron
```

### Manual Trigger (Admin)
```
POST /api/admin/trigger-cron
Body: {"job": "all"}
```

### Check Status (Admin)
```
GET /api/admin/trigger-cron
```

### Emergency Disable
```bash
mv vercel.json vercel.json.disabled && git push
```

---

## Support Resources

- **Vercel Cron Docs**: https://vercel.com/docs/cron-jobs
- **Full Setup Guide**: `CRON_SETUP.md`
- **Test Script**: `scripts/test-cron.ts`
- **Admin Dashboard**: `/api/admin/trigger-cron`

---

## Deployment Complete! 🎉

Once you see `[CRON]` entries in Vercel logs and notifications being sent, your automated notification system is live!

**Next Steps:**
1. Monitor for first 24 hours
2. Create test notifications to verify
3. Set up optional monitoring/alerts
4. Document any custom configurations
5. Celebrate! 🍾
