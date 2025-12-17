# Email System Documentation 📧

## Overview

The Mindful Champion email system uses [Resend](https://resend.com) for reliable, developer-friendly email delivery.

## Quick Start

### 1. Get Resend API Key
1. Sign up at https://resend.com
2. Navigate to API Keys: https://resend.com/api-keys
3. Create new API key
4. Copy the key (starts with `re_...`)

### 2. Set Environment Variable

**Local Development:**
```bash
# Add to .env.local
RESEND_API_KEY=re_your_actual_api_key_here
```

**Production (Vercel):**
1. Go to Vercel project → Settings → Environment Variables
2. Add new variable:
   - **Name:** `RESEND_API_KEY`
   - **Value:** Your Resend API key
   - **Environments:** Production, Preview, Development
3. Redeploy application

### 3. Verify Domain (Production)

**Using Sandbox (Quick Test):**
- Sandbox mode (`@resend.dev` emails) only sends to verified recipients
- Add recipient emails at: https://resend.com/domains/resend.dev

**Custom Domain (Production Ready):**
1. Go to: https://resend.com/domains
2. Click "Add Domain"
3. Enter your domain (e.g., `mindfulchampion.com`)
4. Add DNS records to your registrar:
   - SPF (TXT record)
   - DKIM (TXT record)
   - DMARC (TXT record)
5. Wait for verification (usually 15-60 minutes)
6. Update email code to use verified domain:
   ```bash
   ./scripts/update-email-domains.sh mindfulchampion.com
   ```

## Email Types

### 1. Sponsor Application Confirmation
**Sent to:** Sponsor applicant
**When:** After form submission
**From:** `onboarding@resend.dev` (or custom domain)
**File:** `lib/email/sponsor-application-email.ts`

### 2. Sponsor Admin Notification
**Sent to:** Admin team
**When:** New sponsor application submitted
**From:** `partnerships@resend.dev` (or custom domain)
**File:** `lib/email/sponsor-admin-notification-email.ts`

### 3. Sponsor Approval Email
**Sent to:** Approved sponsor
**When:** Admin approves application
**From:** `onboarding@resend.dev` (or custom domain)
**File:** `lib/email/sponsor-approval-email.ts`

### 4. Video Analysis Complete
**Sent to:** User
**When:** AI video analysis completes
**File:** Various video-related email files

## Testing

### Test Email Delivery
```bash
# Set test email address (optional)
export TEST_EMAIL_ADDRESS=your-email@example.com

# Run test script
npm run ts-node scripts/test-email-delivery.ts
```

### Check Email Logs
```bash
npm run ts-node scripts/check-email-logs.ts
```

### Monitor in Resend Dashboard
- View all sent emails: https://resend.com/emails
- Check delivery status
- Review bounces and errors
- Monitor API usage

## Database Logging

All emails are logged to the `EmailNotification` table:

```typescript
{
  id: string
  userId?: string
  type: EmailNotificationType
  recipientEmail: string
  recipientName?: string
  subject: string
  htmlContent: string
  textContent?: string
  status: 'PENDING' | 'SENT' | 'FAILED'
  sentAt?: DateTime
  deliveredAt?: DateTime
  failedAt?: DateTime
  error?: string
  resendEmailId?: string
  retryCount: number
  metadata?: Json
}
```

### Query Email Status (Prisma Studio)
```bash
npx prisma studio
# Navigate to EmailNotification table
# Filter by status='FAILED' to see errors
```

### Admin Panel
View email logs at: `/admin` → Email Management

## Architecture

```
API Route
    ↓
Email Function (e.g., sendSponsorApprovalEmail)
    ↓
getResendClient() → Resend Client (Singleton)
    ↓
resend.emails.send()
    ↓
Resend API
    ↓
Log to EmailNotification table
```

## Error Handling

### Missing API Key
```typescript
// Logs warning and returns mock client
❌ [EMAIL NOT SENT - RESEND_API_KEY MISSING]
```

### Invalid Domain
```typescript
// Logs error if domain not verified
Error: Domain not verified in Resend
```

### Delivery Failure
```typescript
// Email saved with status='FAILED' and error message
// Does NOT block application workflow (e.g., sponsor approval proceeds)
```

## Troubleshooting

### Issue: Emails not delivering

**Check 1: API Key**
```bash
# Verify in Vercel
vercel env ls

# Should show RESEND_API_KEY for all environments
```

**Check 2: Domain Verification**
- Sandbox domains only send to verified recipients
- Verify domain at: https://resend.com/domains
- Check DNS records propagation

**Check 3: Resend Dashboard**
- Go to: https://resend.com/emails
- Find recent emails
- Check delivery status
- Review error messages

**Check 4: Database Logs**
```sql
SELECT * FROM "EmailNotification" 
WHERE status = 'FAILED' 
ORDER BY "createdAt" DESC 
LIMIT 10;
```

**Check 5: Application Logs**
- View Vercel logs for email-related errors
- Look for `❌ [EMAIL` or `⚠️ CRITICAL` messages

### Issue: "Domain not verified" error

**Solution:**
1. Add domain in Resend: https://resend.com/domains
2. Add DNS records to your registrar
3. Wait for verification
4. Update code to use verified domain:
   ```bash
   ./scripts/update-email-domains.sh your-domain.com
   ```

### Issue: API key invalid

**Solution:**
1. Generate new key: https://resend.com/api-keys
2. Update in Vercel environment variables
3. Redeploy application

### Issue: Rate limits exceeded

**Solution:**
- Free tier: 100 emails/day
- Upgrade plan: https://resend.com/pricing
- Implement email queuing/batching

## Best Practices

### 1. Use Custom Domain
✅ **DO:** `noreply@mindfulchampion.com`
❌ **DON'T:** `onboarding@resend.dev`

### 2. Handle Errors Gracefully
```typescript
try {
  await sendEmail(...)
  console.log('✅ Email sent')
} catch (error) {
  console.error('❌ Email failed:', error)
  // Log to database, don't throw
}
```

### 3. Log All Emails
```typescript
await prisma.emailNotification.create({
  data: {
    recipientEmail,
    subject,
    status: 'SENT',
    resendEmailId: result.data?.id,
    // ... other fields
  }
})
```

### 4. Monitor Delivery
- Check Resend dashboard daily
- Set up alerts for failed emails
- Review bounce rates

### 5. Test Before Deploy
```bash
# Run test suite
npm run ts-node scripts/test-email-delivery.ts

# Submit test sponsor application
# Check email delivery
```

## Configuration Files

| File | Purpose |
|------|---------|
| `lib/email/resend-client.ts` | Resend client singleton |
| `lib/email/sponsor-approval-email.ts` | Approval email template |
| `lib/email/sponsor-admin-notification-email.ts` | Admin notification |
| `lib/email/sponsor-application-email.ts` | Applicant confirmation |
| `lib/email/log-email.ts` | Database logging utility |
| `lib/email/email-service.ts` | Email service abstraction |
| `scripts/test-email-delivery.ts` | Testing script |
| `scripts/update-email-domains.sh` | Domain update helper |

## Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `RESEND_API_KEY` | ✅ Yes | Resend API key | `re_ABC123...` |
| `ADMIN_EMAIL` | ⚠️ Recommended | Admin notification email | `admin@mindfulchampion.com` |
| `NEXT_PUBLIC_APP_URL` | ⚠️ Recommended | App URL for email links | `https://mindfulchampion.com` |

## Resources

- **Resend Dashboard:** https://resend.com
- **API Documentation:** https://resend.com/docs
- **Email Logs:** https://resend.com/emails
- **Domains:** https://resend.com/domains
- **API Keys:** https://resend.com/api-keys
- **Pricing:** https://resend.com/pricing
- **Support:** support@resend.com

## Support

### Internal
- Email system questions: Review this README
- Test email delivery: `npm run ts-node scripts/test-email-delivery.ts`
- Check logs: Admin panel → Email Management

### External
- Resend support: support@resend.com
- Resend docs: https://resend.com/docs
- Resend status: https://status.resend.com

---

**Last Updated:** December 12, 2025
**Version:** 1.0.0
