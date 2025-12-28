# Mindful Champion Email Quick Reference

## 📬 All 27 Email Types at a Glance

---

## 🔐 Authentication & Account (3 emails)

| # | Email | Trigger | From |
|---|-------|---------|------|
| 1 | **Welcome Email** | User signs up | `noreply@` |
| 2 | **Password Reset** | User clicks "Forgot Password" | `noreply@` |
| 3 | **Trial Expiration** | 7-day trial ends | `noreply@` |

---

## 🏋️ Training & Progress (5 emails)

| # | Email | Trigger | From |
|---|-------|---------|------|
| 4 | **Goal Confirmation** | User creates goal | `noreply@` |
| 5 | **Daily Goal Tip** | Daily at 8am (active goals) | `noreply@` |
| 6 | **Video Analysis Complete** | AI finishes processing video | `noreply@` |
| 7 | **Video Analysis Failed** | Video processing error | `noreply@` |
| 8 | **Achievement Unlocked** | User earns badge/achievement | `noreply@` |

---

## 💳 Subscription & Billing (6 emails)

| # | Email | Trigger | From |
|---|-------|---------|------|
| 9 | **Subscription Confirmation** | User subscribes to paid plan | `noreply@` |
| 10 | **Subscription Renewal** | Auto-renewal succeeds | `noreply@` |
| 11 | **Subscription Expiring** | 7, 3, or 1 days before expiration | `noreply@` |
| 12 | **Subscription Cancelled** | User/admin cancels subscription | `noreply@` |
| 13 | **Subscription Upgrade** | Admin manually upgrades account | `noreply@` |
| 14 | **Payment Receipt** | Payment successfully processed | `noreply@` |

---

## 🏆 Tournament Management (3 emails)

| # | Email | Trigger | From |
|---|-------|---------|------|
| 15 | **Tournament Registration** | User registers for tournament | `noreply@` |
| 16 | **Tournament Reminder** | 24, 3, or 1 hours before event | `noreply@` |
| 17 | **Tournament Results** | Tournament concludes | `noreply@` |

---

## 🤝 Community & Social (1 email)

| # | Email | Trigger | From |
|---|-------|---------|------|
| 18 | **Partner Request** | User sends practice partner request | `noreply@` |

---

## 🎬 Media & Content (1 email)

| # | Email | Trigger | From |
|---|-------|---------|------|
| 19 | **New Media Content** | New video/podcast published | `noreply@` |

---

## 🎁 Rewards & Redemptions (4 emails)

| # | Email | Trigger | From |
|---|-------|---------|------|
| 20 | **Redemption Request** | User requests reward redemption | `noreply@` |
| 21 | **Redemption Approved** | Admin approves redemption | `noreply@` |
| 22 | **Redemption Shipped** | Physical reward ships | `noreply@` |
| 23 | **Reward Tier Unlock** | User reaches new reward tier | `rewards@` |

---

## 🏢 Sponsor Management (2 emails)

| # | Email | Trigger | From |
|---|-------|---------|------|
| 24 | **Sponsor Application Received** | Company applies to become sponsor | `partners@` |
| 25 | **Sponsor Application Approved** | Admin approves sponsor application | `partners@` |

---

## 🛡️ Admin & Moderation (3 emails + 4 variants)

### User Warnings (4 severity levels)

| # | Email | Severity | Color | Icon |
|---|-------|----------|-------|------|
| 26a | **Warning - LOW** | Advisory Notice | Blue | 💙 |
| 26b | **Warning - MEDIUM** | Important Notice | Orange | ⚠️ |
| 26c | **Warning - HIGH** | Urgent Notice | Red | 🚨 |
| 26d | **Warning - FINAL** | Final Warning | Dark Red | ⛔ |

### Admin Alerts (Internal)

| # | Email | Trigger | To |
|---|-------|---------|------|
| 27 | **Admin New User Alert** | New user registers | `dean@` |
| 28 | **Admin Payment Alert** | Payment processed | `dean@` |
| 29 | **Admin System Error** | Critical system error | `dean@` |

---

## 🧪 Testing (1 email)

| # | Email | Trigger | From |
|---|-------|---------|------|
| 30 | **Test Email** | Admin clicks "Send Test" | `noreply@` |

---

## 📊 Email Accounts Summary

| Email Account | Purpose | Email Count |
|--------------|---------|-------------|
| `noreply@mindfulchampion.com` | Primary (user-facing) | 24 emails |
| `partners@mindfulchampion.com` | Sponsor communications | 2 emails |
| `rewards@mindfulchampion.com` | Reward system | 1 email |
| `dean@mindfulchampion.com` | Reply-to address | N/A |

**Total:** 27 unique email types (30 including warning variants)

---

## 🚀 Automated vs Manual

### Automated Emails (20)
- **User Action Triggers:** Welcome, password reset, goal creation, partner request, redemption, registration
- **System Events:** Video analysis complete/failed, achievement unlock, payment processing
- **Scheduled/Cron:** Trial expiration, daily tips, subscription expiring, tournament reminders

### Manual Admin Emails (7)
- Subscription upgrade
- Warnings (all 4 levels)
- Sponsor approval
- Test email

### Admin Notifications (3)
- New user alert
- Payment alert
- System error alert

---

## ⚡ Critical Emails (High Priority)

These emails contain time-sensitive or security-critical information:

1. **Password Reset** - Security credential
2. **Sponsor Application Approved** - Login credentials
3. **Warning - FINAL** - Account termination risk
4. **Payment Receipt** - Financial record
5. **Subscription Expiring** - Service interruption warning
6. **Tournament Reminder** - Time-sensitive event

---

## 📧 Email Type Distribution

```
Authentication & Account:  11% (3 emails)
Training & Progress:       19% (5 emails)
Subscription & Billing:    22% (6 emails)
Tournament Management:     11% (3 emails)
Community & Social:         4% (1 email)
Media & Content:            4% (1 email)
Rewards & Redemptions:     15% (4 emails)
Sponsor Management:         7% (2 emails)
Admin & Moderation:        26% (7 emails)
Testing:                    4% (1 email)
```

---

## 🔍 Finding Email Code

### Quick File Lookup

| Email Category | Primary File |
|---------------|--------------|
| Most user emails | `lib/email/unified-email-service.ts` |
| Welcome, warnings, partner | `lib/email.ts` |
| Goal tips, tournaments, achievements | `lib/notifications/email-templates.ts` |
| Sponsor emails | `lib/email/sponsor-*.ts` |
| Reward tier unlock | `lib/email/reward-tier-unlock-email.ts` |
| Subscription upgrade | `lib/email/subscription-upgrade-email.ts` |
| Trial management | `lib/media-center/email-service.ts` |

### API Endpoints (Triggers)

| Action | Endpoint |
|--------|----------|
| Signup | `POST /api/signup` |
| Password reset | `POST /api/auth/forgot-password` |
| Partner request | `POST /api/partners/request` |
| Sponsor apply | `POST /api/sponsors/apply` |
| Sponsor approve | `POST /api/admin/sponsors/applications/[id]/approve` |
| Manual upgrade | `POST /api/admin/users/[userId]/subscription/manual-upgrade` |
| Send warning | `POST /api/admin/users/[userId]/warnings` |
| Test email | `POST /api/admin/emails/test` |

---

## 🎨 Email Branding

### Standard Elements in All Emails
- **Header:** Gradient background with icon
- **Logo:** "Mindful Champion" with 🏆 or category emoji
- **Tone:** Warm, encouraging, professional
- **CTA Buttons:** Rounded, gradient, shadow effects
- **Footer:** Copyright, support info, app description
- **Colors:** 
  - Primary: Teal/Cyan gradient (#14b8a6, #06b6d4)
  - Success: Green (#10b981)
  - Warning: Orange (#f59e0b)
  - Error: Red (#ef4444)
  - Info: Blue (#3b82f6)

### Coach Kai Signature (Training Emails)
```
Best in the game,
Coach Kai
Your Mindful Champion Coach
```

---

## ✅ Production Checklist

Before deploying email changes:

- [ ] Domain verified in Resend dashboard (`mindfulchampion.com`)
- [ ] DNS records configured (SPF, DKIM, DMARC)
- [ ] `RESEND_API_KEY` set in production environment
- [ ] All email accounts tested (`noreply@`, `partners@`, `rewards@`)
- [ ] Test email sent successfully from admin panel
- [ ] Database logging confirmed working
- [ ] Email notification table has proper indexes
- [ ] Rate limiting tested (password reset)
- [ ] Unsubscribe links functional (if applicable)
- [ ] Mobile responsiveness verified

---

**Quick Access Links:**
- 📄 Full Documentation: `EMAIL_CATALOG.md`
- 🔧 Domain Setup: `RESEND_DOMAIN_SETUP_GUIDE.md`
- 📊 Admin Dashboard: `/admin/emails`
- 🧪 Test Emails: `POST /api/admin/emails/test`

**Last Updated:** December 22, 2025
