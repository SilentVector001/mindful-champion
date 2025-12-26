# Google Workspace License Cancellation Guide
## Mindful Champion - Save $36/month by Removing 6 Unused Licenses

**Date:** December 18, 2024  
**Objective:** Cancel 6 Google Workspace licenses and keep only dean@mindfulchampion.com  
**Monthly Savings:** $36/month ($6 per license × 6 licenses)  
**Annual Savings:** $432/year

---

## ✅ PART 1: RESEND API KEY VERIFICATION (COMPLETED)

### Status: **VERIFIED AND CONFIGURED** ✅

The RESEND_API_KEY has been successfully verified in Vercel environment variables:

- **Variable Name:** RESEND_API_KEY
- **Environment:** All Environments (Production, Preview, Development)
- **Last Updated:** December 14, 2024
- **Status:** Active and properly configured

**Screenshot Reference:** See Vercel Environment Variables screenshot showing RESEND_API_KEY

### What This Means:
- ✅ Your app is now using Resend for email delivery (not Gmail SMTP)
- ✅ Gmail SMTP configuration has been removed from the codebase (commit 305673a)
- ✅ You can safely cancel Google Workspace licenses without affecting email functionality
- ✅ Emails will be sent through Resend API using your verified domain

---

## 📋 PART 2: GOOGLE WORKSPACE LICENSES TO CANCEL

### Licenses to CANCEL (6 total):
1. **welcomefrommc@mindfulchampion.com** - Welcome email sender
2. **coachkai@mindfulchampion.com** - AI Coach email sender
3. **support@mindfulchampion.com** - Support email sender
4. **partners@mindfulchampion.com** - Partnership email sender
5. **sponsors@mindfulchampion.com** - Sponsorship email sender
6. **admin@mindfulchampion.com** - Admin email sender

### License to KEEP (1 total):
- **dean@mindfulchampion.com** - Your primary admin account ✅

---

## 🔐 PART 3: ACCESSING GOOGLE WORKSPACE ADMIN CONSOLE

### Step 1: Navigate to Google Admin Console

1. Open your web browser
2. Go to: **https://admin.google.com**
3. You will be redirected to Google sign-in page

### Step 2: Sign In with Admin Account

1. **Email:** dean@mindfulchampion.com (should be pre-filled)
2. **Password:** Enter your Google Workspace admin password
3. Click **"Next"** button
4. Complete any 2-factor authentication if enabled

**Important:** You must sign in with an account that has Super Admin privileges to manage users and licenses.

---

## 👥 PART 4: DELETING OR SUSPENDING USERS

### Understanding the Difference:

#### **DELETE USER** (Recommended for unused service accounts)
- **Pros:**
  - Immediately frees up the license
  - Removes the user completely from your organization
  - Stops billing immediately
  - Clean and permanent solution
- **Cons:**
  - User data is deleted after 20 days (recoverable within 20 days)
  - Cannot be undone after 20 days
- **Best for:** Service accounts that were never used for actual email communication

#### **SUSPEND USER** (Recommended if you want to keep data)
- **Pros:**
  - Keeps all user data intact
  - Can be reactivated later if needed
  - Preserves email history
- **Cons:**
  - **DOES NOT free up the license** - You will still be charged!
  - User cannot access their account but license remains assigned
- **Best for:** Temporary deactivation or if you need to preserve data

### ⚠️ IMPORTANT RECOMMENDATION:
**For your use case, DELETE the users** because:
1. These are service email accounts (not real people)
2. Your app now uses Resend API (not these Gmail accounts)
3. You want to save money by freeing up licenses
4. Suspending will NOT save you money - you'll still be charged!

---

## 📝 PART 5: STEP-BY-STEP DELETION PROCESS

### Step 1: Access Users Section

1. After signing in to admin.google.com, you'll see the Admin Console dashboard
2. Look for the **"Users"** card or menu item (usually in the left sidebar or main dashboard)
3. Click on **"Users"** to view all user accounts

### Step 2: Locate the User to Delete

1. You'll see a list of all users in your organization
2. Use the search bar to find specific users, or scroll through the list
3. You should see all 7 accounts:
   - dean@mindfulchampion.com (KEEP THIS ONE)
   - welcomefrommc@mindfulchampion.com
   - coachkai@mindfulchampion.com
   - support@mindfulchampion.com
   - partners@mindfulchampion.com
   - sponsors@mindfulchampion.com
   - admin@mindfulchampion.com

### Step 3: Delete Each User (Repeat for all 6 accounts)

For each of the 6 accounts to delete:

1. **Click on the user's name** (e.g., welcomefrommc@mindfulchampion.com)
2. This opens the user details page
3. Look for the **"More options"** menu (three vertical dots ⋮) or **"Delete user"** button
4. Click **"Delete user"** or **"More options" → "Delete user"**
5. A confirmation dialog will appear with important information:
   - Warning about data deletion
   - Option to transfer data to another user (optional)
   - Confirmation that the license will be freed
6. **Optional:** If you want to transfer any data (emails, Drive files) to dean@mindfulchampion.com:
   - Check the box for "Transfer data to another user"
   - Select dean@mindfulchampion.com as the recipient
7. Click **"Delete"** or **"Delete user"** to confirm
8. The user will be deleted and the license will be freed immediately

### Step 4: Repeat for All 6 Accounts

Repeat Step 3 for each of these accounts:
- ✅ welcomefrommc@mindfulchampion.com
- ✅ coachkai@mindfulchampion.com
- ✅ support@mindfulchampion.com
- ✅ partners@mindfulchampion.com
- ✅ sponsors@mindfulchampion.com
- ✅ admin@mindfulchampion.com

**DO NOT DELETE:** dean@mindfulchampion.com (your admin account)

---

## 🔍 PART 6: VERIFYING LICENSE REDUCTION

### Step 1: Check Active Users Count

1. In the Google Admin Console, go back to the **Users** section
2. At the top of the page, you should see a summary showing:
   - **Total users:** Should now show **1** (only dean@mindfulchampion.com)
   - **Active licenses:** Should show **1**

### Step 2: Check Billing & Subscriptions

1. In the Admin Console, navigate to **"Billing"** or **"Subscriptions"**
2. Look for **"Google Workspace"** subscription
3. Verify the license count:
   - **Before:** 7 licenses
   - **After:** 1 license
4. Check the monthly cost:
   - **Before:** $42/month (7 × $6)
   - **After:** $6/month (1 × $6)
   - **Savings:** $36/month

### Step 3: Verify Next Billing Cycle

1. In the Billing section, check your next billing date
2. The reduced license count should be reflected in your next invoice
3. Google typically prorates charges, so you may see a credit for unused days

---

## 📊 PART 7: EXPECTED RESULTS

### Before Cancellation:
- **Total Users:** 7
- **Active Licenses:** 7
- **Monthly Cost:** $42/month
- **Annual Cost:** $504/year

### After Cancellation:
- **Total Users:** 1 (dean@mindfulchampion.com)
- **Active Licenses:** 1
- **Monthly Cost:** $6/month
- **Annual Cost:** $72/year
- **Monthly Savings:** $36/month ✅
- **Annual Savings:** $432/year ✅

---

## ⚠️ IMPORTANT NOTES & WARNINGS

### 1. Data Recovery Period
- Deleted users can be restored within **20 days**
- After 20 days, user data is permanently deleted
- If you need to recover a user, go to **Users → Deleted users** in Admin Console

### 2. Email Functionality
- Your app will continue to send emails through **Resend API**
- The deleted Gmail accounts will no longer receive or send emails
- Make sure all app email configurations point to Resend (already done in commit 305673a)

### 3. Domain Aliases
- If any of these email addresses are used as aliases, remove them first
- Check **Users → [User] → User information → Email aliases**

### 4. Email Forwarding
- If any of these accounts have email forwarding rules, they will stop working
- Check if you need to preserve any forwarding rules

### 5. Shared Drives & Files
- If any of these accounts own shared drives or important files, transfer ownership first
- Go to **Apps → Google Workspace → Drive and Docs → Manage shared drives**

### 6. Calendar Events
- If any of these accounts created calendar events, they may be affected
- Consider transferring calendar ownership if needed

### 7. Admin Privileges
- Make sure dean@mindfulchampion.com has Super Admin privileges
- Do not delete your only admin account!

---

## 🆘 TROUBLESHOOTING

### Issue: "Cannot delete user - user is the only admin"
**Solution:** Make sure dean@mindfulchampion.com has Super Admin privileges before deleting admin@mindfulchampion.com

### Issue: "User has data that needs to be transferred"
**Solution:** 
- Choose to transfer data to dean@mindfulchampion.com
- Or skip data transfer if the account was never used

### Issue: "License count hasn't changed"
**Solution:**
- Wait a few minutes for the system to update
- Refresh the Admin Console page
- Check the Billing section for updated license count

### Issue: "Still being charged for 7 licenses"
**Solution:**
- Verify users were **deleted** (not suspended)
- Check the next billing cycle - changes may take effect then
- Contact Google Workspace support if charges persist

---

## 📞 SUPPORT RESOURCES

### Google Workspace Support
- **Help Center:** https://support.google.com/a/
- **Contact Support:** https://support.google.com/a/answer/1047213
- **Phone Support:** Available for paid accounts (check your admin console)

### Resend Support (for email issues)
- **Documentation:** https://resend.com/docs
- **Support:** https://resend.com/support

---

## ✅ COMPLETION CHECKLIST

Use this checklist to track your progress:

- [ ] Verified RESEND_API_KEY in Vercel (COMPLETED ✅)
- [ ] Signed in to Google Admin Console (admin.google.com)
- [ ] Navigated to Users section
- [ ] Deleted welcomefrommc@mindfulchampion.com
- [ ] Deleted coachkai@mindfulchampion.com
- [ ] Deleted support@mindfulchampion.com
- [ ] Deleted partners@mindfulchampion.com
- [ ] Deleted sponsors@mindfulchampion.com
- [ ] Deleted admin@mindfulchampion.com
- [ ] Verified only dean@mindfulchampion.com remains
- [ ] Checked Billing section for updated license count
- [ ] Confirmed monthly cost reduced to $6/month
- [ ] Tested app email functionality (send test email through Resend)
- [ ] Documented completion date: _______________

---

## 📸 VISUAL GUIDE SCREENSHOTS

### Screenshot 1: Vercel Environment Variables
**Location:** Vercel → mindful-champion → Settings → Environment Variables  
**Shows:** RESEND_API_KEY properly configured for all environments

### Screenshot 2: Google Admin Console Sign-In
**Location:** admin.google.com  
**Shows:** Sign-in page with dean@mindfulchampion.com

### Screenshot 3: Users Section (Before)
**Expected:** List of 7 users including all service accounts

### Screenshot 4: Delete User Dialog
**Expected:** Confirmation dialog with options to transfer data

### Screenshot 5: Users Section (After)
**Expected:** Only 1 user remaining (dean@mindfulchampion.com)

### Screenshot 6: Billing Section
**Expected:** License count reduced from 7 to 1, cost reduced to $6/month

---

## 🎯 SUMMARY

This guide walks you through:
1. ✅ Verifying Resend API key is configured (COMPLETED)
2. Accessing Google Workspace Admin Console
3. Understanding the difference between deleting and suspending users
4. Deleting 6 unused service email accounts
5. Keeping only dean@mindfulchampion.com
6. Verifying license reduction and cost savings
7. Troubleshooting common issues

**Expected Outcome:** Save $36/month ($432/year) by reducing from 7 to 1 Google Workspace license while maintaining full email functionality through Resend API.

---

## 📝 NOTES SECTION

Use this space to document your experience:

**Date Started:** _______________  
**Date Completed:** _______________  
**Issues Encountered:** _______________  
**Final License Count:** _______________  
**Final Monthly Cost:** _______________  
**Confirmation:** _______________

---

**Document Created:** December 18, 2024  
**Last Updated:** December 18, 2024  
**Version:** 1.0  
**Author:** DeepAgent AI Assistant  
**For:** Dean Snow - Mindful Champion Project
