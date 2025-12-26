# Mindful Champion Email Catalog
## Comprehensive List of All Outbound Emails

**Last Updated:** December 22, 2025  
**System:** Mindful Champion Pickleball Training Platform  
**Email Provider:** Resend API (mindfulchampion.com)

---

## 📧 Email Overview

The Mindful Champion platform sends **27 unique email types** across 10 different categories. All emails are sent via the Resend API from verified `@mindfulchampion.com` addresses.

### Email Sending Accounts
- **Primary (Most emails):** `noreply@mindfulchampion.com`
- **Partners:** `partners@mindfulchampion.com` (sponsor-related)
- **Rewards:** `rewards@mindfulchampion.com` (reward tier unlocks)
- **Reply-To:** `dean@mindfulchampion.com`

---

## 📁 Email Categories & Complete List

### 1️⃣ **Authentication & Account Management**

#### 1.1 Welcome Email
- **Type:** `WELCOME`
- **Sent When:** User completes signup
- **From:** `Mindful Champion 🏆 <noreply@mindfulchampion.com>`
- **Subject:** `🏓 Welcome to Mindful Champion - Your Journey Begins!`
- **Contains:**
  - Welcome message with user's first name
  - 7-day free trial information
  - Quick start guide (4 steps)
  - Feature highlights (AI coaching, training plans, analytics)
  - CTA to dashboard
- **Files:**
  - `lib/email.ts` - `sendWelcomeEmail()`
  - `lib/media-center/email-service.ts` - `sendWelcomeEmail()`
  - `app/api/signup/route.ts` (trigger)
- **Notes:** Sent immediately after user registration

---

#### 1.2 Password Reset Email
- **Type:** `PASSWORD_RESET`
- **Sent When:** User requests password reset via "Forgot Password"
- **From:** `Mindful Champion 🏆 <noreply@mindfulchampion.com>`
- **Subject:** `Reset Your Mindful Champion Password`
- **Contains:**
  - Password reset link (expires in 1 hour)
  - Security information (IP address, expiration time)
  - Warning if user didn't request reset
  - Alternative text link if button doesn't work
- **Files:**
  - `app/api/auth/forgot-password/route.ts`
  - `lib/email/unified-email-service.ts` - `generatePasswordResetEmail()`
- **Rate Limit:** 3 requests per 15 minutes per email
- **Notes:** Always returns success to prevent email enumeration

---

#### 1.3 Trial Expiration Email
- **Type:** `TRIAL_EXPIRATION`
- **Sent When:** User's 7-day trial ends
- **From:** `Mindful Champion <noreply@mindfulchampion.com>`
- **Subject:** `Thank you for exploring Mindful Champion!`
- **Contains:**
  - Thank you message
  - Free tier features (basic videos, community, Coach Kai basic)
  - Premium tier features (live streams, full podcasts, advanced analytics)
  - CTA to upgrade to premium
  - CTA to continue with free account
- **Files:**
  - `lib/media-center/email-service.ts` - `sendTrialExpirationEmail()`
  - `lib/media-center/trial-management.ts` (trigger)
- **Notes:** Sent automatically when trial ends

---

### 2️⃣ **Training & Progress**

#### 2.1 Goal Confirmation Email
- **Type:** `GOAL_CONFIRMATION` (via notification system)
- **Sent When:** User creates a new goal
- **From:** `Mindful Champion <noreply@mindfulchampion.com>`
- **Subject:** `🎯 Your [Goal Type] is Set – Let's Make It Happen!`
- **Contains:**
  - Goal details (description, target date)
  - What happens next (tracking, video analysis, daily tips)
  - CTA to Goals Dashboard
  - Coach Kai signature
- **Files:**
  - `lib/notifications/email-templates.ts` - `goalConfirmationEmail()`
  - `lib/notifications/notification-service.ts` (trigger)
- **Notes:** Uses Coach Kai's warm, encouraging tone

---

#### 2.2 Daily Goal Tip Email
- **Type:** `DAILY_GOAL_TIP` (via notification system)
- **Sent When:** Daily automated tip for active goals
- **From:** `Mindful Champion <noreply@mindfulchampion.com>`
- **Subject:** `🌟 Daily Tip: [Name], Here's What Champions Do Today`
- **Contains:**
  - Progress percentage toward goal
  - Daily championship tip
  - Quick win suggestion (visualization exercise)
  - Motivational quote
  - CTA to start today's session
- **Files:**
  - `lib/notifications/email-templates.ts` - `dailyGoalTipEmail()`
  - `lib/workers/process-goal-notifications.ts` (trigger)
- **Notes:** Sent daily to users with active goals

---

#### 2.3 Video Analysis Complete Email
- **Type:** `VIDEO_ANALYSIS_COMPLETE`
- **Sent When:** AI video analysis finishes processing
- **From:** `Mindful Champion <noreply@mindfulchampion.com>`
- **Subject:** `🎥 Your Analysis is Ready – Time to Level Up!`
- **Contains:**
  - Video title and key insights
  - Coach's note (watch within 24 hours)
  - CTA to watch analysis
  - Coach Kai signature
- **Files:**
  - `lib/notifications/email-templates.ts` - `videoAnalysisCompleteEmail()`
  - Video analysis processing logic (trigger)
- **Notes:** Sent after video processing completes

---

#### 2.4 Video Analysis Failed Email
- **Type:** `VIDEO_ANALYSIS_FAILED`
- **Sent When:** Video analysis encounters an error
- **From:** `Mindful Champion <noreply@mindfulchampion.com>`
- **Subject:** `❌ Video Analysis Issue - [Video Title]`
- **Contains:**
  - Video title
  - Error reason/explanation
  - Instructions to retry or contact support
- **Files:**
  - `lib/email/unified-email-service.ts` - `generateAnalysisFailedEmail()`
  - Video analysis error handling (trigger)
- **Notes:** Sent when video processing fails

---

#### 2.5 Achievement Unlocked Email
- **Type:** `ACHIEVEMENT_UNLOCKED`
- **Sent When:** User earns an achievement/badge
- **From:** `Mindful Champion <noreply@mindfulchampion.com>`
- **Subject:** `🏅 Achievement Unlocked: [Achievement Name]`
- **Contains:**
  - Large badge icon
  - Achievement name and description
  - Reward points earned
  - "What's Next?" guidance
  - CTA to view all achievements
  - Coach Kai signature
- **Files:**
  - `lib/notifications/email-templates.ts` - `achievementUnlockedEmail()`
  - Achievement system (trigger)
- **Notes:** Celebratory email with animated header

---

### 3️⃣ **Subscription & Billing**

#### 3.1 Subscription Confirmation Email
- **Type:** `SUBSCRIPTION_CONFIRMATION`
- **Sent When:** User subscribes to PRO/PREMIUM
- **From:** `Mindful Champion <noreply@mindfulchampion.com>`
- **Subject:** `✅ Subscription Confirmed - Welcome to [Plan Name]!`
- **Contains:**
  - Plan name, amount, billing date
  - Features included in plan
  - Billing information
  - CTA to dashboard
- **Files:**
  - `lib/email/unified-email-service.ts` - `generateSubscriptionConfirmationEmail()`
  - Subscription webhook handlers (trigger)
- **Notes:** Sent after successful payment

---

#### 3.2 Subscription Renewal Email
- **Type:** `SUBSCRIPTION_RENEWAL`
- **Sent When:** Subscription auto-renews
- **From:** `Mindful Champion <noreply@mindfulchampion.com>`
- **Subject:** `🔄 Subscription Renewed - [Plan Name]`
- **Contains:**
  - Renewal confirmation
  - Amount charged
  - Next billing date
  - Receipt/invoice link
- **Files:**
  - `lib/email/unified-email-service.ts`
  - Subscription webhook handlers (trigger)
- **Notes:** Sent after successful renewal payment

---

#### 3.3 Subscription Expiring Email
- **Type:** `SUBSCRIPTION_EXPIRING`
- **Sent When:** Subscription is about to expire (7, 3, 1 days before)
- **From:** `Mindful Champion <noreply@mindfulchampion.com>`
- **Subject:** `⏰ Your [Plan Name] Expires in [X] Days`
- **Contains:**
  - Days until expiration
  - What will be lost (features)
  - CTA to renew subscription
  - Special renewal offer (optional)
- **Files:**
  - `lib/email/unified-email-service.ts` - `generateSubscriptionExpiringEmail()`
  - Subscription management cron job (trigger)
- **Notes:** Sent at 7, 3, and 1 day intervals

---

#### 3.4 Subscription Cancelled Email
- **Type:** `SUBSCRIPTION_CANCELLED`
- **Sent When:** User or admin cancels subscription
- **From:** `Mindful Champion <noreply@mindfulchampion.com>`
- **Subject:** `❌ Subscription Cancelled - [Plan Name]`
- **Contains:**
  - Cancellation confirmation
  - End date (access until when)
  - What happens next (free tier access)
  - CTA to reactivate (optional)
- **Files:**
  - `lib/email/unified-email-service.ts` - `generateSubscriptionCancelledEmail()`
  - Subscription cancellation handlers (trigger)
- **Notes:** Sent immediately after cancellation

---

#### 3.5 Subscription Upgrade Email (Manual Admin)
- **Type:** Manual admin upgrade
- **Sent When:** Admin manually upgrades user account
- **From:** `Mindful Champion <noreply@mindfulchampion.com>`
- **Subject:** `🎉 Welcome to [NEW TIER] Access!`
- **Contains:**
  - Congratulations message
  - Old tier → New tier change
  - All features included in new tier
  - Expiration date (if applicable)
  - Billing cycle info
  - Quick links to premium features
- **Files:**
  - `lib/email/subscription-upgrade-email.ts` - `sendSubscriptionUpgradeEmail()`
  - `app/api/admin/users/[userId]/subscription/manual-upgrade/route.ts` (trigger)
- **Notes:** Only sent for manual upgrades by admin

---

#### 3.6 Payment Receipt Email
- **Type:** `PAYMENT_RECEIPT`
- **Sent When:** Payment is successfully processed
- **From:** `Mindful Champion <noreply@mindfulchampion.com>`
- **Subject:** `💳 Payment Receipt - [Amount]`
- **Contains:**
  - Amount paid
  - Plan name
  - Transaction ID
  - Date of payment
  - Itemized breakdown
  - PDF receipt (optional)
- **Files:**
  - `lib/email/unified-email-service.ts` - `generatePaymentReceiptEmail()`
  - Payment webhook handlers (trigger)
- **Notes:** Sent after each successful payment

---

### 4️⃣ **Tournament Management**

#### 4.1 Tournament Registration Email
- **Type:** `TOURNAMENT_REGISTRATION`
- **Sent When:** User registers for a tournament
- **From:** `Mindful Champion <noreply@mindfulchampion.com>`
- **Subject:** `✅ Tournament Registration Confirmed - [Tournament Name]`
- **Contains:**
  - Tournament name, date, location
  - Registration confirmation
  - Pre-tournament checklist
  - What to bring
  - CTA to tournament details
- **Files:**
  - `lib/email/unified-email-service.ts` - `generateTournamentRegistrationEmail()`
  - Tournament registration system (trigger)
- **Notes:** Sent immediately after registration

---

#### 4.2 Tournament Reminder Email
- **Type:** `TOURNAMENT_REMINDER`
- **Sent When:** Tournament is approaching (24, 3, 1 hours before)
- **From:** `Mindful Champion <noreply@mindfulchampion.com>`
- **Subject:** `🏆 Tournament Alert: [Tournament Name] is Coming Up!`
- **Contains:**
  - Hours until tournament
  - Tournament details (name, location)
  - Pre-tournament game plan (5 steps)
  - Motivational quote
  - CTA to tournament prep
- **Files:**
  - `lib/notifications/email-templates.ts` - `tournamentReminderEmail()`
  - Tournament reminder cron job (trigger)
- **Notes:** Multiple reminders sent at intervals

---

#### 4.3 Tournament Results Email
- **Type:** `TOURNAMENT_RESULTS`
- **Sent When:** Tournament concludes and results are available
- **From:** `Mindful Champion <noreply@mindfulchampion.com>`
- **Subject:** `🏆 Tournament Results - [Tournament Name]`
- **Contains:**
  - User's placement (rank)
  - Total participants
  - Performance highlights
  - Areas for improvement
  - CTA to view detailed results
- **Files:**
  - `lib/email/unified-email-service.ts` - `generateTournamentResultsEmail()`
  - Tournament results processing (trigger)
- **Notes:** Sent after tournament completion

---

### 5️⃣ **Community & Social**

#### 5.1 Partner Request Email
- **Type:** Partner connection request
- **Sent When:** User sends practice partner request
- **From:** `Mindful Champion 🤝 <noreply@mindfulchampion.com>`
- **Subject:** `🤝 [Sender Name] wants to connect with you!`
- **Contains:**
  - Sender name and skill level
  - Personal message (if included)
  - CTA to view and respond to request
  - Benefits of connecting
- **Files:**
  - `lib/email.ts` - `sendPartnerRequestEmail()`
  - `app/api/partners/request/route.ts` (trigger)
- **Notes:** Sent when user receives partner request

---

### 6️⃣ **Media & Content**

#### 6.1 New Media Content Email
- **Type:** `NEW_MEDIA_CONTENT` (via notification system)
- **Sent When:** New videos, podcasts, or media are added
- **From:** `Mindful Champion <noreply@mindfulchampion.com>`
- **Subject:** `🎬 New [Content Type] Just Dropped: [Title]`
- **Contains:**
  - Content title and type
  - Content description
  - Preview/thumbnail
  - CTA to watch/listen
- **Files:**
  - `lib/notifications/email-templates.ts` - `newMediaContentEmail()`
  - Media upload system (trigger)
- **Notes:** Sent when new content is published

---

### 7️⃣ **Rewards & Redemptions**

#### 7.1 Redemption Request Email
- **Type:** `REDEMPTION_REQUEST`
- **Sent When:** User requests to redeem reward points
- **From:** `Mindful Champion <noreply@mindfulchampion.com>`
- **Subject:** `🎁 Redemption Request Received - [Reward Name]`
- **Contains:**
  - Reward name and description
  - Points cost
  - Request ID
  - What happens next (approval process)
  - Expected timeline
- **Files:**
  - `lib/email/unified-email-service.ts` - `generateRedemptionRequestEmail()`
  - Reward redemption system (trigger)
- **Notes:** Sent when user submits redemption request

---

#### 7.2 Redemption Approved Email
- **Type:** `REDEMPTION_APPROVED`
- **Sent When:** Admin approves redemption request
- **From:** `Mindful Champion <noreply@mindfulchampion.com>`
- **Subject:** `✅ Redemption Approved - [Reward Name]`
- **Contains:**
  - Reward name
  - Sponsor name
  - Redemption instructions
  - How to claim reward
  - Contact info for sponsor
- **Files:**
  - `lib/email/unified-email-service.ts` - `generateRedemptionApprovedEmail()`
  - Redemption approval handlers (trigger)
- **Notes:** Sent after admin approval

---

#### 7.3 Redemption Shipped Email
- **Type:** `REDEMPTION_SHIPPED`
- **Sent When:** Physical reward is shipped
- **From:** `Mindful Champion <noreply@mindfulchampion.com>`
- **Subject:** `📦 Your Reward is On the Way - [Reward Name]`
- **Contains:**
  - Reward name
  - Tracking number
  - Carrier information
  - Estimated delivery date
  - Tracking link
- **Files:**
  - `lib/email/unified-email-service.ts` - `generateRedemptionShippedEmail()`
  - Shipping system integration (trigger)
- **Notes:** Sent when sponsor ships physical reward

---

#### 7.4 Reward Tier Unlock Email
- **Type:** Reward tier upgrade
- **Sent When:** User earns enough points to reach new reward tier
- **From:** `Mindful Champion <rewards@mindfulchampion.com>`
- **Subject:** `🎉 Congratulations! You've Unlocked [Tier Name]!`
- **Contains:**
  - Large tier icon and celebration
  - Tier name (Bronze/Silver/Gold/Platinum)
  - Points at unlock
  - Exclusive tier benefits
  - Next tier preview (if applicable)
  - CTA to explore rewards
- **Files:**
  - `lib/email/reward-tier-unlock-email.ts` - `sendRewardTierUnlockEmail()`
  - Reward points calculation system (trigger)
- **Notes:** Celebratory email with tier-specific colors

---

### 8️⃣ **Sponsor Management**

#### 8.1 Sponsor Application Received Email
- **Type:** `SPONSOR_APPLICATION`
- **Sent When:** Company submits sponsor application
- **From:** `Mindful Champion Partners <partners@mindfulchampion.com>`
- **Subject:** `🎉 Application Received - [Company Name] | Mindful Champion`
- **Contains:**
  - Application confirmation
  - Company name and contact person
  - Interested tier
  - Application ID
  - What happens next (review process, 3-5 days)
  - What they'll get if approved (portal access, analytics, etc.)
  - Preview of portal URL
- **Files:**
  - `lib/email/sponsor-application-email.ts` - `sendSponsorApplicationEmail()`
  - `app/api/sponsors/apply/route.ts` (trigger)
- **Notes:** Sent immediately after application submission

---

#### 8.2 Sponsor Application Approved Email
- **Type:** Sponsor approval with credentials
- **Sent When:** Admin approves sponsor application
- **From:** `Mindful Champion Partners <partners@mindfulchampion.com>`
- **Subject:** `✅ Approved! Welcome to Mindful Champion, [Company Name] 🎉`
- **Contains:**
  - **LARGE SECTION:** Brand awareness philosophy (rewards-based discovery vs traditional ads)
  - Approval confirmation with tier emoji (🥉🥈🥇💎)
  - **Portal login credentials** (email + temporary password if new user)
  - Security instructions (change password immediately)
  - Quick start guide (5 steps)
  - Tier-specific benefits list
  - Portal features overview
  - Support contact info
  - CTA to access portal
- **Files:**
  - `lib/email/sponsor-approval-email.ts` - `sendSponsorApprovalEmail()`
  - `app/api/admin/sponsors/applications/[applicationId]/approve/route.ts` (trigger)
- **Notes:** Contains sensitive login credentials - most important email for sponsors

---

### 9️⃣ **Admin & Moderation**

#### 9.1 User Warning Email (LOW Severity)
- **Type:** Moderation warning
- **Sent When:** Admin issues LOW severity warning
- **From:** `Mindful Champion Security Team 🛡️ <noreply@mindfulchampion.com>`
- **Subject:** `💙 Advisory Notice - Mindful Champion`
- **Color:** Blue (#3b82f6)
- **Contains:**
  - Polite, friendly tone
  - Reason for warning
  - Quoted content (if applicable)
  - Message/guidance
  - Support contact info
  - CTA to dashboard
- **Files:**
  - `lib/email.ts` - `sendWarningEmail()`
  - `app/api/admin/users/[userId]/warnings/route.ts` (trigger)
- **Notes:** Friendly advisory format

---

#### 9.2 User Warning Email (MEDIUM Severity)
- **Type:** Moderation warning
- **Sent When:** Admin issues MEDIUM severity warning
- **From:** `Mindful Champion Security Team 🛡️ <noreply@mindfulchampion.com>`
- **Subject:** `⚠️ Important Notice - Mindful Champion`
- **Color:** Orange (#f59e0b)
- **Contains:**
  - More serious tone than LOW
  - Clear reason and quoted content
  - Explicit guidelines reminder
  - Support contact info
- **Files:**
  - `lib/email.ts` - `sendWarningEmail()`
  - Admin warning system (trigger)
- **Notes:** Escalated from LOW warning

---

#### 9.3 User Warning Email (HIGH Severity)
- **Type:** Moderation warning
- **Sent When:** Admin issues HIGH severity warning
- **From:** `Mindful Champion Security Team 🛡️ <noreply@mindfulchampion.com>`
- **Subject:** `🚨 Urgent Notice - Mindful Champion`
- **Color:** Red (#ef4444)
- **Contains:**
  - Serious tone
  - Violation details
  - Potential consequences
  - Last chance before FINAL warning
- **Files:**
  - `lib/email.ts` - `sendWarningEmail()`
  - Admin warning system (trigger)
- **Notes:** Second-to-last warning level

---

#### 9.4 User Warning Email (FINAL Severity)
- **Type:** Moderation warning
- **Sent When:** Admin issues FINAL warning before ban
- **From:** `Mindful Champion Security Team 🛡️ <noreply@mindfulchampion.com>`
- **Subject:** `⛔ Final Warning - Mindful Champion`
- **Color:** Dark Red (#991b1b)
- **Contains:**
  - **FINAL WARNING** banner
  - Explicit statement that next violation = account suspension
  - All violation history
  - Appeal process information
- **Files:**
  - `lib/email.ts` - `sendWarningEmail()`
  - Admin warning system (trigger)
- **Notes:** Last warning before account termination

---

#### 9.5 Admin New User Alert
- **Type:** `ADMIN_NEW_USER`
- **Sent When:** New user registers (admin notification)
- **To:** `dean@mindfulchampion.com` (admin email)
- **From:** `Mindful Champion <noreply@mindfulchampion.com>`
- **Subject:** `👤 New User Signup - [User Name]`
- **Contains:**
  - User name and email
  - User ID
  - Signup date/time
  - Initial subscription tier
  - CTA to view user in admin panel
- **Files:**
  - `lib/email/unified-email-service.ts` - `generateNewUserAlertEmail()`
  - User registration handlers (trigger)
- **Notes:** Internal notification for admins

---

#### 9.6 Admin Payment Alert
- **Type:** `ADMIN_PAYMENT`
- **Sent When:** User makes a payment (admin notification)
- **To:** `dean@mindfulchampion.com` (admin email)
- **From:** `Mindful Champion <noreply@mindfulchampion.com>`
- **Subject:** `💰 New Payment - $[Amount] from [User Name]`
- **Contains:**
  - User name and email
  - Amount paid
  - Plan name
  - Transaction ID
  - Payment date/time
  - CTA to view transaction in admin panel
- **Files:**
  - `lib/email/unified-email-service.ts` - `generatePaymentAlertEmail()`
  - Payment webhook handlers (trigger)
- **Notes:** Internal notification for admins

---

#### 9.7 Admin System Error Alert
- **Type:** `ADMIN_ERROR`
- **Sent When:** Critical system error occurs
- **To:** `dean@mindfulchampion.com` (admin email)
- **From:** `Mindful Champion <noreply@mindfulchampion.com>`
- **Subject:** `🚨 System Error - [Error Type]`
- **Contains:**
  - Error type and message
  - Full error stack trace
  - User ID (if applicable)
  - Timestamp
  - Server/environment info
  - CTA to logs/monitoring
- **Files:**
  - `lib/email/unified-email-service.ts` - `generateSystemErrorAlertEmail()`
  - Global error handlers (trigger)
- **Notes:** Critical alerts for system monitoring

---

### 🔟 **Testing & Utilities**

#### 10.1 Test Email
- **Type:** `CUSTOM` test email
- **Sent When:** Admin uses test email feature
- **From:** `Mindful Champion 🏆 <noreply@mindfulchampion.com>`
- **Subject:** `🧪 Test Email - Mindful Champion`
- **Contains:**
  - Simple test message
  - Confirmation that email system is working
  - Timestamp
- **Files:**
  - `lib/email/unified-email-service.ts` - `sendTestEmail()`
  - `app/api/admin/emails/test/route.ts` (trigger)
  - Admin email management dashboard
- **Notes:** Used for testing email configuration

---

## 🔧 Technical Implementation

### Email Service Architecture

```
┌─────────────────────────────────────────────┐
│       Unified Email Service (Primary)       │
│   lib/email/unified-email-service.ts        │
│   - Handles 20+ email types                 │
│   - Template generation                     │
│   - Resend API integration                  │
│   - Database logging                        │
└─────────────────┬───────────────────────────┘
                  │
                  ├─────────────────────────────────┐
                  │                                 │
         ┌────────▼────────┐          ┌────────────▼──────────┐
         │  Legacy Service │          │ Specialized Services  │
         │  lib/email.ts   │          │ - sponsor emails      │
         │  - Welcome      │          │ - reward tier unlock  │
         │  - Partner req. │          │ - subscription upgrade│
         │  - Warnings     │          │ - notification system │
         └─────────────────┘          └───────────────────────┘
```

### Email Template Locations

1. **Unified Templates:** `lib/email/templates/` (organized by category)
2. **Notification Templates:** `lib/notifications/email-templates.ts` (Coach Kai personality)
3. **Specialized Templates:** Individual files in `lib/email/`

### Database Logging

All emails are logged to the `EmailNotification` table with:
- User ID (if applicable)
- Email type
- Recipient info
- Subject and content
- Status (SENT/FAILED/DELIVERED)
- Resend email ID (for tracking)
- Metadata (custom fields per email type)

---

## 📊 Email Statistics & Monitoring

### Admin Dashboard Access
- **URL:** `/admin/emails`
- **Features:**
  - Email history with filters
  - Delivery statistics
  - Test email functionality
  - Custom email sender

### Monitoring Endpoints
- **History:** `GET /api/admin/emails/history`
- **Test Send:** `POST /api/admin/emails/test`

---

## 🚨 Critical Notes

### Domain Verification Required
⚠️ **IMPORTANT:** The Resend domain `mindfulchampion.com` must be verified in the Resend dashboard for emails to send in production.

**Steps to verify:**
1. Log into Resend dashboard
2. Add domain: `mindfulchampion.com`
3. Add DNS records (SPF, DKIM, DMARC) at domain registrar
4. Wait for verification (usually 24-48 hours)

**See:** `RESEND_DOMAIN_SETUP_GUIDE.md` for detailed instructions

### Environment Variables
```env
RESEND_API_KEY=re_... (required)
NEXT_PUBLIC_APP_URL=https://mindfulchampion.com
NEXTAUTH_URL=https://mindfulchampion.com
```

### Rate Limiting
- **Password Reset:** 3 requests per 15 minutes per email
- **General emails:** No explicit rate limit (handled by Resend)

---

## 📈 Email Triggers Summary

| Trigger Type | Email Count | Examples |
|-------------|-------------|----------|
| **User Action** | 8 | Signup, partner request, goal creation, redemption |
| **Admin Action** | 5 | Manual upgrade, warnings, sponsor approval |
| **Automated/Cron** | 7 | Trial expiration, daily tips, tournament reminders |
| **System Event** | 4 | Video complete/failed, achievement unlock, errors |
| **Webhook** | 6 | Payments, subscriptions, renewals |
| **Testing** | 1 | Test email |

**Total:** 27 unique email types + variants (severity levels, etc.)

---

## 🎯 Next Steps for Email Enhancement

1. **Analytics Integration:** Track open rates, click rates via Resend webhooks
2. **A/B Testing:** Test different subject lines and CTAs
3. **Personalization:** Dynamic content based on user behavior
4. **Unsubscribe Management:** Preference center for email types
5. **Email Scheduling:** Queue emails for optimal send times
6. **Template Preview:** Admin UI to preview all email templates

---

**Document Prepared by:** DeepAgent  
**For:** Mindful Champion Development Team  
**Contact:** dean@mindfulchampion.com
