# Gmail Setup Guide for Mindful Champion

## Purpose
This guide walks you through setting up Gmail for sending email notifications from the Mindful Champion application.

---

## Prerequisites

✅ A Gmail account (existing or new)
✅ 2-Factor Authentication enabled on your Gmail account
✅ Access to Google Account settings

---

## Step 1: Enable 2-Factor Authentication

Before you can create an App Password, you MUST enable 2-Factor Authentication.

### Instructions:

1. **Go to Google Account Security**
   - Visit: https://myaccount.google.com/security

2. **Enable 2-Step Verification**
   - Click on "2-Step Verification"
   - Follow the prompts to set it up
   - You can use:
     - Phone number (SMS or call)
     - Google Authenticator app
     - Security key

3. **Verify It's Working**
   - Try signing out and back in
   - You should be prompted for the second factor

⚠️ **IMPORTANT**: You cannot create App Passwords without 2FA enabled.

---

## Step 2: Generate App Password

An App Password is a 16-character code that allows apps like Mindful Champion to send emails through your Gmail account.

### Instructions:

1. **Navigate to App Passwords**
   - Visit: https://myaccount.google.com/apppasswords
   - Or go to: Google Account → Security → 2-Step Verification → App passwords

2. **Select App and Device**
   - Select app: **Mail**
   - Select device: **Other (Custom name)**
   - Enter name: **Mindful Champion**
   - Click **Generate**

3. **Copy the App Password**
   - Google will display a 16-character password (with spaces)
   - Example: `mtjl wqxx gxpz uqwe`
   - **Copy this immediately** - you won't see it again!

4. **Remove Spaces**
   - The password should be entered WITHOUT spaces
   - Example: `your_gmail_app_password_here`

5. **Save to .env**
   ```env
   GMAIL_APP_PASSWORD=your_gmail_app_password_here
   ```

---

## Step 3: Configure Email Addresses

Set up the various email addresses used by the application.

### 1. Primary Gmail Account

This is the Gmail account that will SEND all emails:

```env
GMAIL_USER=welcomefrommc@mindfulchampion.com
```

**Options**:
- Use your existing Gmail
- Create a dedicated Gmail for the app
- Use a G Suite/Google Workspace email

**Recommendation**: Use a dedicated Gmail account for better organization and security.

### 2. Notification Email (FROM address)

This appears as the "From" address in notification emails:

```env
NOTIFICATION_EMAIL=welcomefrommc@mindfulchampion.com
```

**Purpose**:
- Goal reminders
- Video analysis completion
- Achievement unlocks
- Training program updates

**Best Practice**: Use a friendly, recognizable name like:
- `notifications@mindfulchampion.com`
- `coach@mindfulchampion.com`
- `updates@mindfulchampion.com`

### 3. Support Email

Receives user support inquiries:

```env
SUPPORT_EMAIL=support@mindfulchampion.com
```

**Purpose**:
- User help requests
- Bug reports
- Feature requests
- Account issues

### 4. Partners Email

For partner communications:

```env
PARTNERS_EMAIL=partners@mindfulchampion.com
```

**Purpose**:
- Partnership inquiries
- Integration requests
- Collaboration opportunities

### 5. Sponsors Email

For sponsor communications:

```env
SPONSORS_EMAIL=sponsors@mindfulchampion.com
```

**Purpose**:
- Sponsor applications
- Offer management
- Sponsor support

### 6. Default FROM Email

Default sender for all outgoing emails:

```env
EMAIL_FROM=welcomefrommc@mindfulchampion.com
```

### 7. Reply-To Email

Where recipients' replies go:

```env
EMAIL_REPLY_TO=dean@mindfulchampion.com
```

**Best Practice**: Use a monitored email address so you can respond to users.

---

## Step 4: Test Email Configuration

After setting up, test that emails work correctly.

### Using the Verification Script

```bash
npm run verify-env
```

This will:
- ✅ Verify Gmail credentials
- ✅ Send a test email
- ✅ Confirm SMTP connection

### Manual Test

You can also test manually:

```bash
node scripts/test-email.ts
```

---

## Email Configuration Options

### Option 1: Single Gmail Account (Simplest)

Use the same Gmail for everything:

```env
GMAIL_USER=welcomefrommc@mindfulchampion.com
NOTIFICATION_EMAIL=welcomefrommc@mindfulchampion.com
SUPPORT_EMAIL=welcomefrommc@mindfulchampion.com
PARTNERS_EMAIL=welcomefrommc@mindfulchampion.com
SPONSORS_EMAIL=welcomefrommc@mindfulchampion.com
EMAIL_FROM=welcomefrommc@mindfulchampion.com
EMAIL_REPLY_TO=welcomefrommc@mindfulchampion.com
```

**Pros**:
- Simple setup
- Single inbox
- Easy to manage

**Cons**:
- All emails in one inbox
- Harder to organize
- Less professional

### Option 2: Multiple Addresses (Recommended)

Use different addresses for different purposes:

```env
GMAIL_USER=welcomefrommc@mindfulchampion.com
NOTIFICATION_EMAIL=welcomefrommc@mindfulchampion.com
SUPPORT_EMAIL=support@mindfulchampion.com
PARTNERS_EMAIL=partners@mindfulchampion.com
SPONSORS_EMAIL=sponsors@mindfulchampion.com
EMAIL_FROM=welcomefrommc@mindfulchampion.com
EMAIL_REPLY_TO=dean@mindfulchampion.com
```

**Pros**:
- Better organization
- Professional appearance
- Easy email routing
- Can use Gmail aliases

**Cons**:
- Requires setting up aliases or forwarding
- Slightly more complex

### Gmail Aliases

You can create aliases using the `+` symbol:

```env
GMAIL_USER=admin@mindfulchampion.com
NOTIFICATION_EMAIL=admin+notifications@mindfulchampion.com
SUPPORT_EMAIL=admin+support@mindfulchampion.com
PARTNERS_EMAIL=admin+partners@mindfulchampion.com
```

All emails still go to `admin@mindfulchampion.com`, but you can filter by the alias.

---

## Troubleshooting

### Error: "Invalid credentials"

**Solutions**:
1. ✅ Verify 2FA is enabled
2. ✅ Generate a new App Password
3. ✅ Remove spaces from App Password
4. ✅ Check GMAIL_USER is correct

### Error: "Less secure app access"

**Solution**: You MUST use an App Password. Gmail no longer allows "less secure app access" for regular passwords.

### Error: "SMTP connection failed"

**Solutions**:
1. ✅ Check your internet connection
2. ✅ Verify firewall isn't blocking port 465 or 587
3. ✅ Try generating a new App Password

### Emails not sending

**Check**:
1. ✅ Gmail daily sending limit (500 emails/day for free Gmail)
2. ✅ Check spam folder of recipient
3. ✅ Verify `EMAIL_FROM` is set correctly
4. ✅ Check application logs for errors

### Emails going to spam

**Solutions**:
1. ✅ Set up SPF record for your domain
2. ✅ Set up DKIM authentication
3. ✅ Use a custom domain (not @gmail.com)
4. ✅ Ask recipients to mark as "Not Spam"

---

## Gmail Sending Limits

### Free Gmail Account
- **500 emails per day**
- **500 unique recipients per day**
- Rolling 24-hour period

### Google Workspace
- **2,000 emails per day**
- **2,000 unique recipients per day**
- Rolling 24-hour period

**What happens if you exceed?**
- Gmail will temporarily block sending
- Typically restores after 24 hours
- Emails will queue and retry

**Recommendation**: Monitor daily email volume and consider Google Workspace for high-volume applications.

---

## Security Best Practices

### 1. Dedicated Gmail Account

✅ Create a separate Gmail account just for the application
✅ Don't use your personal Gmail
✅ Use a strong, unique password

### 2. App Password Security

✅ Never commit App Password to git
✅ Store in .env file (already in .gitignore)
✅ Rotate App Password every 90 days
✅ Revoke old App Passwords

### 3. Monitoring

✅ Enable Gmail security alerts
✅ Monitor for suspicious activity
✅ Check "Recent activity" regularly
✅ Set up Google Account activity alerts

### 4. Backup Options

✅ Configure Resend as backup (already set up)
✅ Have a secondary Gmail account ready
✅ Monitor email delivery rates

---

## Advanced: Using Custom Domain with Gmail

If you want emails to come from `@mindfulchampion.com` instead of `@gmail.com`:

### Option 1: Google Workspace (Recommended)

1. Sign up for Google Workspace
2. Verify your domain
3. Create email accounts (e.g., `notifications@mindfulchampion.com`)
4. Use these accounts in your .env

**Pros**:
- Professional appearance
- Higher sending limits (2,000/day)
- Better deliverability
- Full Gmail features

**Cost**: ~$6/user/month

### Option 2: Gmail + Custom Domain

1. Set up Gmail forwarding
2. Configure SPF and DKIM records
3. Use Gmail's "Send mail as" feature

**Note**: More complex, but free. Less reliable than Google Workspace.

---

## Testing Checklist

### Basic Tests

- ☐ Send test email to yourself
- ☐ Verify email arrives
- ☐ Check email formatting (HTML)
- ☐ Verify links work
- ☐ Check FROM and REPLY-TO addresses

### Notification Tests

- ☐ Test goal reminder email
- ☐ Test video analysis completion
- ☐ Test achievement unlock
- ☐ Test welcome email
- ☐ Test password reset

### Deliverability Tests

- ☐ Send to Gmail
- ☐ Send to Outlook/Hotmail
- ☐ Send to Yahoo
- ☐ Send to corporate email
- ☐ Check spam folder

---

## Quick Reference

### Required Variables

```env
# Primary Gmail account
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password

# Email addresses
NOTIFICATION_EMAIL=welcomefrommc@mindfulchampion.com
SUPPORT_EMAIL=support@mindfulchampion.com
PARTNERS_EMAIL=partners@mindfulchampion.com
SPONSORS_EMAIL=sponsors@mindfulchampion.com
EMAIL_FROM=welcomefrommc@mindfulchampion.com
EMAIL_REPLY_TO=dean@mindfulchampion.com

# Configuration
EMAIL_NOTIFICATIONS_ENABLED=true
```

### Generate App Password

1. Enable 2FA: https://myaccount.google.com/security
2. Create App Password: https://myaccount.google.com/apppasswords
3. Copy 16-character code (remove spaces)
4. Add to .env file

### Test Email

```bash
npm run verify-env
```

---

**Last Updated**: December 3, 2025
**Status**: Production Ready
**Support**: For issues, contact the development team
