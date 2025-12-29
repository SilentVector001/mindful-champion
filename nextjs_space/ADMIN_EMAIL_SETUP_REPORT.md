# Mindful Champion Admin & Email Setup Report
**Generated:** December 18, 2025  
**Working Directory:** `/home/ubuntu/mindful_champion/nextjs_space/`

---

## Executive Summary

Your Mindful Champion application has a **dual email system** setup with both **Resend** and **Gmail SMTP** integration. The app has a robust user management system with role-based access control. This report explains the current setup, identifies configuration gaps, and provides actionable recommendations.

---

## 🔐 Current Admin Account Status

### Verified Working Account
- **Email:** `deansnow59@gmail.com`
- **Role:** `ADMIN`
- **Subscription:** `PRO`
- **Status:** Active and verified

### Database User Model
The app uses PostgreSQL with Prisma ORM. The User model includes:
- **Role System:** 3 roles available
  - `USER` (default)
  - `ADMIN` (full access)
  - `SPONSOR` (partner access)
- **Subscription Tiers:** `FREE`, `PRO`
- **Authentication:** NextAuth with credentials provider
- **Password Storage:** bcrypt hashed passwords

### Admin Features Available
With your ADMIN role (`deansnow59@gmail.com`), you have access to:
- `/admin` - Admin dashboard
- `/api/admin/*` - All admin API endpoints
- User management (create, edit, delete users)
- Email notification management
- Analytics and reporting
- Security settings
- Subscription management
- Sponsor applications review

---

## 📧 Email Service Configuration

### Current Setup: Dual Email System

Your application is configured to use **TWO** email services:

#### 1. **Resend** (Primary for transactional emails)
- **Service:** [resend.com](https://resend.com)
- **Configuration File:** `lib/email/resend-client.ts`
- **Domain:** `@mindfulchampion.com`
- **Status:** ⚠️ **NEEDS VERIFICATION**

**Required Environment Variable:**
```
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

**Resend Email Accounts Configured:**
| Email Address | Purpose | Used For |
|--------------|---------|----------|
| `noreply@mindfulchampion.com` | System emails | Sign ups, payments, rewards, notifications |
| `partners@mindfulchampion.com` | Partner communications | Sponsor applications, business inquiries |
| `dean@mindfulchampion.com` | Admin emails | Administrative emails, support, personal communications |

**Email Types Using Resend:**
- Signup/welcome emails
- Payment confirmations
- Reward notifications
- Achievement unlocks
- Sponsor application notifications
- Partner invitations
- Admin custom emails

#### 2. **Gmail SMTP** (Alternative/Fallback)
- **Service:** Gmail SMTP (smtp.gmail.com:587)
- **Configuration Files:** 
  - `lib/email/gmail-sender.ts`
  - `lib/email/gmail-service.ts`
- **Status:** ⚠️ **NEEDS VERIFICATION**

**Required Environment Variables:**
```
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
```

**Gmail Email Accounts Configured:**
| Email Address | Purpose | Used For |
|--------------|---------|----------|
| `welcomefrommc@mindfulchampion.com` | Welcome emails | General notifications |
| `coachkai@mindfulchampion.com` | Coach Kai | Video analysis, training updates |
| `support@mindfulchampion.com` | Support | Help requests |
| `partners@mindfulchampion.com` | Partnerships | Partner communications |
| `sponsors@mindfulchampion.com` | Sponsorships | Sponsor applications |
| `admin@mindfulchampion.com` | Admin | Billing, admin emails |

---

## 💰 Email Service Costs Explained

### Resend Pricing
- **Free Tier:** 100 emails/day, 3,000 emails/month
- **Pro Tier:** $20/month for 50,000 emails/month
- **Scale Tier:** Custom pricing
- **Domain Setup:** FREE
- **Multiple sender addresses:** Unlimited (on same domain)

**For Mindful Champion:**
- All `@mindfulchampion.com` emails use **ONE** Resend account
- You only need **ONE** `RESEND_API_KEY`
- All 3 email addresses (noreply@, partners@, dean@) are **FREE** once domain is verified
- Cost depends only on volume of emails sent, not number of sender addresses

### Gmail SMTP Option
- **FREE** if using personal Gmail account
- **Limited:** 500 emails/day sending limit
- **Not Recommended for Production:** Gmail is designed for personal use, not bulk transactional emails
- **Google Workspace ($6/user/month):** Professional email with higher limits
  - Each user (email address) requires separate subscription
  - Example: dean@mindfulchampion.com would cost $6/month

### Recommendation: Use Resend
✅ **Recommended:** Use Resend for all transactional emails
- Better deliverability
- Professional email infrastructure
- Webhook support for tracking (opens, clicks, bounces)
- All sender addresses on same domain are free
- More reliable than Gmail for transactional emails

---

## 🔑 Environment Variables Required

### Production (Vercel)
These environment variables should be set in your Vercel project settings:

#### Essential Variables
```bash
# Database
DATABASE_URL=postgresql://...

# NextAuth
NEXTAUTH_URL=https://mindfulchampion.com
NEXTAUTH_SECRET=your-secret-here

# Resend Email (RECOMMENDED)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Abacus AI (for Coach Kai)
ABACUSAI_API_KEY=your-abacus-api-key
```

#### Optional Variables (Gmail Alternative)
```bash
# Gmail SMTP (only if not using Resend)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx

# Custom email sender addresses (optional overrides)
EMAIL_FROM_WELCOME=welcomefrommc@mindfulchampion.com
EMAIL_FROM_COACH_KAI=coachkai@mindfulchampion.com
EMAIL_FROM_SUPPORT=support@mindfulchampion.com
EMAIL_FROM_PARTNERS=partners@mindfulchampion.com
EMAIL_FROM_SPONSORS=sponsors@mindfulchampion.com
EMAIL_FROM_ADMIN=admin@mindfulchampion.com
```

### How to Check Current Vercel Environment Variables
1. Go to [vercel.com](https://vercel.com)
2. Select your Mindful Champion project
3. Go to **Settings** → **Environment Variables**
4. Check if `RESEND_API_KEY` is set
5. Check if `GMAIL_USER` and `GMAIL_APP_PASSWORD` are set

---

## 🛠️ Password Reset & Admin Access

### How to Reset Admin Password

#### Option 1: Use Forgot Password Flow (Recommended)
1. Go to `https://mindfulchampion.com/auth/forgot-password`
2. Enter your email: `deansnow59@gmail.com`
3. Check your email for reset link
4. Click link and set new password
5. Password requirements:
   - Minimum 8 characters
   - At least 1 uppercase letter
   - At least 1 lowercase letter
   - At least 1 number

**Files Involved:**
- Frontend: `/app/auth/forgot-password/page.tsx`
- API: `/app/api/auth/forgot-password/route.ts`
- Reset: `/app/api/auth/reset-password/route.ts`

**Security Features:**
- Rate limited: 3 requests per 15 minutes per email
- Token expires in 1 hour
- IP address tracking
- Prevents email enumeration

#### Option 2: Direct Database Update (Emergency Only)
If email service is not working, you can reset password directly in database:

```bash
# Generate new password hash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('YourNewPassword123', 10));"

# Update in database (use Prisma Studio or direct SQL)
# Replace with your hash from above
```

#### Option 3: Create New Admin via API (Coming Soon)
You can create a diagnostic endpoint to manually create/update admin accounts.

---

## 📊 User Management & Diagnostic Tools

### New Diagnostic Endpoint Created
I've created a new admin diagnostic endpoint:

**Endpoint:** `https://mindfulchampion.com/api/admin/check-users`

**Access:** Admin only (requires authentication)

**Returns:**
- Total user count
- User count by role (ADMIN, USER, SPONSOR)
- User count by subscription (FREE, PRO)
- Complete list of all users with:
  - Email, name, role
  - Subscription status
  - Trial information
  - Last active date

**How to Use:**
1. Sign in to your admin account
2. Visit: `https://mindfulchampion.com/api/admin/check-users`
3. View complete user database

**File Created:** `/app/api/admin/check-users/route.ts`

### Existing Admin Features
Your app already has comprehensive admin features:

- **User Management:** `/app/api/admin/users/route.ts`
- **User Analytics:** `/app/api/admin/users/analytics/route.ts`
- **Login History:** `/app/api/admin/users/login-history/route.ts`
- **Security Settings:** `/app/api/admin/security/route.ts`
- **Email Management:** `/app/api/admin/emails/send/route.ts`
- **Sponsor Management:** `/app/api/admin/sponsors/`
- **Revenue Analytics:** `/app/api/admin/analytics/revenue/route.ts`

---

## 📋 Action Items & Recommendations

### Immediate Actions Required

#### 1. Verify Email Service Setup
**Choose ONE primary email service:**

**Option A: Use Resend (Recommended)**
- [ ] Sign up at [resend.com](https://resend.com)
- [ ] Create API key
- [ ] Add `RESEND_API_KEY` to Vercel environment variables
- [ ] Verify domain `mindfulchampion.com` in Resend dashboard
- [ ] Add DNS records (SPF, DKIM, DMARC) to your domain registrar
- [ ] Test email sending via `/app/api/admin/emails/test/route.ts`

**Option B: Use Gmail SMTP (Not Recommended for Production)**
- [ ] Create Gmail App Password for your account
- [ ] Add `GMAIL_USER` and `GMAIL_APP_PASSWORD` to Vercel
- [ ] Note: 500 emails/day limit
- [ ] Consider Google Workspace for professional setup

#### 2. Test Password Reset Flow
- [ ] Go to `/auth/forgot-password`
- [ ] Request password reset for `deansnow59@gmail.com`
- [ ] Verify email delivery
- [ ] Complete password reset
- [ ] Document new password securely

#### 3. Verify Admin Access
- [ ] Sign in with admin account
- [ ] Visit `/admin` dashboard
- [ ] Test user management features
- [ ] Verify all admin endpoints are accessible

#### 4. Check Current Users
- [ ] Visit `https://mindfulchampion.com/api/admin/check-users`
- [ ] Review all user accounts
- [ ] Verify role assignments
- [ ] Check for any duplicate or test accounts

### Medium Priority Tasks

#### 5. Email Domain Configuration
If using Resend with `mindfulchampion.com`:
- [ ] Add SPF record: `v=spf1 include:_spf.resend.com ~all`
- [ ] Add DKIM records (provided by Resend)
- [ ] Add DMARC record: `v=DMARC1; p=none; rua=mailto:dean@mindfulchampion.com`
- [ ] Verify domain in Resend dashboard shows green checkmarks

#### 6. Test All Email Flows
- [ ] Welcome email on signup
- [ ] Password reset email
- [ ] Video analysis completion email
- [ ] Achievement unlock email
- [ ] Sponsor application notification
- [ ] Payment confirmation email

#### 7. Monitor Email Deliverability
- [ ] Check Resend dashboard for delivery stats
- [ ] Monitor bounce rates
- [ ] Check spam complaints
- [ ] Review open rates

### Long-term Recommendations

#### 8. Security Hardening
- [ ] Enable 2FA for admin accounts (future feature)
- [ ] Regular security audits
- [ ] Monitor login attempts
- [ ] Review admin access logs

#### 9. Email Template Optimization
- [ ] A/B test subject lines
- [ ] Improve email design
- [ ] Add personalization
- [ ] Track engagement metrics

#### 10. User Management Enhancements
- [ ] Bulk user operations
- [ ] Export user data
- [ ] Advanced filtering
- [ ] User segmentation

---

## 🆘 Troubleshooting Guide

### Problem: Emails Not Being Sent

#### Check 1: Environment Variables
```bash
# In Vercel dashboard, verify these are set:
RESEND_API_KEY=re_xxxxx  (if using Resend)
# OR
GMAIL_USER=email@gmail.com (if using Gmail)
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
```

#### Check 2: Email Service Logs
- Resend: Visit [resend.com/emails](https://resend.com/emails)
- Gmail: Check Gmail Sent folder
- Application logs: Check Vercel deployment logs

#### Check 3: Domain Verification
- Resend: Check domain status in Resend dashboard
- DNS records: Use [mxtoolbox.com](https://mxtoolbox.com) to verify SPF/DKIM

#### Check 4: Code Configuration
- Check `lib/email/config.ts` for email account settings
- Check `lib/email/resend-client.ts` for Resend setup
- Check `lib/email/gmail-sender.ts` for Gmail setup

### Problem: Cannot Access Admin Features

#### Solution 1: Verify Admin Role
```sql
-- Check your role in database
SELECT email, role FROM "User" WHERE email = 'deansnow59@gmail.com';
-- Should return role = 'ADMIN'
```

#### Solution 2: Clear Session and Re-login
- Sign out completely
- Clear browser cookies
- Sign in again with admin account

#### Solution 3: Check Authentication
- Verify `NEXTAUTH_SECRET` is set in Vercel
- Check `NEXTAUTH_URL` matches your domain

### Problem: Password Reset Not Working

#### Check 1: Token Expiry
- Tokens expire in 1 hour
- Request new reset link if expired

#### Check 2: Rate Limiting
- Maximum 3 requests per 15 minutes
- Wait if rate limit exceeded

#### Check 3: Email Delivery
- Check spam folder
- Verify email service is configured
- Check application logs for errors

---

## 📞 Support & Resources

### Documentation
- **Resend Docs:** https://resend.com/docs
- **NextAuth Docs:** https://next-auth.js.org
- **Prisma Docs:** https://www.prisma.io/docs
- **Vercel Docs:** https://vercel.com/docs

### Key Files Reference
| File | Purpose |
|------|---------|
| `lib/email/config.ts` | Email account configuration |
| `lib/email/resend-client.ts` | Resend API client |
| `lib/email/gmail-sender.ts` | Gmail SMTP integration |
| `app/api/auth/forgot-password/route.ts` | Password reset request |
| `app/api/auth/reset-password/route.ts` | Password reset completion |
| `app/api/admin/check-users/route.ts` | User diagnostic endpoint (NEW) |
| `lib/security.ts` | Password hashing & token management |
| `prisma/schema.prisma` | Database schema |

### Contact Information
- **Domain:** mindfulchampion.com
- **Repository:** https://github.com/SilentVector001/mindful-champion
- **Admin Email:** deansnow59@gmail.com

---

## 🎯 Recommended Admin Email Setup

Based on your needs and to minimize costs, here's my recommendation:

### Recommended Configuration

**Use Resend with `dean@mindfulchampion.com` as primary admin email:**

1. **Set up Resend:**
   - One account at resend.com
   - Verify `mindfulchampion.com` domain
   - Cost: FREE for up to 3,000 emails/month
   - Cost: $20/month for up to 50,000 emails/month

2. **Email addresses (all FREE on verified domain):**
   - `noreply@mindfulchampion.com` - System emails
   - `partners@mindfulchampion.com` - Business inquiries
   - `dean@mindfulchampion.com` - Your admin email
   - `coachkai@mindfulchampion.com` - Coach Kai emails
   - `support@mindfulchampion.com` - Support emails

3. **Keep using `deansnow59@gmail.com` for admin login:**
   - This is your authentication/login email
   - Keep using for admin dashboard access
   - No cost, uses your existing Gmail

4. **Use `dean@mindfulchampion.com` for sending emails:**
   - Professional appearance
   - All outbound emails from this address
   - Configured in Resend

### Cost Breakdown:
- **Resend:** $0 - $20/month (depending on volume)
- **Domain:** $10-15/year (you already have this)
- **Google Workspace:** NOT NEEDED
- **Total:** ~$20/month or less

### Benefits:
- ✅ Professional email addresses
- ✅ Reliable delivery
- ✅ Webhook tracking
- ✅ Low cost
- ✅ Scalable
- ✅ No per-user fees

---

## ✅ Quick Start Checklist

Copy this checklist to track your setup:

```
Email Service Setup:
[ ] Sign up for Resend account
[ ] Add RESEND_API_KEY to Vercel environment variables
[ ] Verify mindfulchampion.com domain in Resend
[ ] Add DNS records (SPF, DKIM, DMARC)
[ ] Test email sending

Admin Account Verification:
[ ] Confirm deansnow59@gmail.com has ADMIN role
[ ] Test admin dashboard access
[ ] Verify password reset flow works
[ ] Check API endpoint: /api/admin/check-users

User Management:
[ ] Review all users in database
[ ] Remove any test accounts
[ ] Verify subscription statuses
[ ] Document admin credentials securely

Email Testing:
[ ] Send test welcome email
[ ] Test password reset email
[ ] Verify Coach Kai notification emails
[ ] Check email delivery in Resend dashboard

Documentation:
[ ] Document admin login credentials
[ ] Save Resend API key securely
[ ] Record DNS configuration
[ ] Create backup admin account (optional)
```

---

**Report End**

*For questions or issues, review the Troubleshooting Guide or check the application logs in Vercel.*
