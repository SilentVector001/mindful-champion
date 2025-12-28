# Resend Domain Setup Guide for mindfulchampion.com

## 🚨 CRITICAL ISSUE IDENTIFIED

**Problem**: Your Resend account shows "updates.reai.io" domain instead of "mindfulchampion.com"

**Impact**:
- ❌ Emails are not being sent from @mindfulchampion.com addresses
- ❌ 422 errors (validation failures) in Resend logs
- ❌ No signup emails or system emails working
- ❌ Only 3 test emails sent (11 days ago)

**Root Cause**: The domain "mindfulchampion.com" has NOT been added or verified in your Resend account.

---

## ✅ SOLUTION: Add mindfulchampion.com Domain to Resend

### Step 1: Add Domain in Resend Dashboard

1. **Go to Resend Domains Page**:
   - Visit: https://resend.com/domains
   - Or from dashboard: Click "Domains" in left sidebar

2. **Click "Add Domain" Button**:
   - Top right corner of the Domains page

3. **Enter Your Domain**:
   ```
   mindfulchampion.com
   ```
   - Click "Add Domain"

4. **Resend will generate DNS records** that you need to add to your domain registrar

---

### Step 2: Get DNS Records from Resend

After adding the domain, Resend will show you **3 DNS records** that must be added:

#### **A. SPF Record (TXT)**
```
Type: TXT
Name: @ (or leave blank, or "mindfulchampion.com" depending on registrar)
Value: v=spf1 include:_spf.resend.com ~all
TTL: 3600 (or Auto)
```

**Purpose**: Authorizes Resend to send emails on behalf of mindfulchampion.com

---

#### **B. DKIM Record (TXT)**
```
Type: TXT
Name: resend._domainkey (or similar - Resend will provide exact name)
Value: [Long alphanumeric string provided by Resend]
TTL: 3600 (or Auto)
```

**Purpose**: Adds digital signature to emails for authentication

---

#### **C. DMARC Record (TXT)** *(Optional but Recommended)*
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dean@mindfulchampion.com
TTL: 3600 (or Auto)
```

**Purpose**: Tells receiving servers how to handle emails that fail SPF/DKIM checks

---

### Step 3: Add DNS Records to Your Domain Registrar

**Where is mindfulchampion.com registered?**
- Common registrars: GoDaddy, Namecheap, Google Domains, Cloudflare, etc.

**Steps (varies by registrar)**:

#### For **GoDaddy**:
1. Go to: https://dcc.godaddy.com/domains
2. Click on "mindfulchampion.com"
3. Scroll to "DNS Management" → "Add"
4. Select "TXT" record type
5. Enter Name and Value from Resend
6. Save and repeat for all 3 records

#### For **Namecheap**:
1. Go to: https://ap.www.namecheap.com/domains/list/
2. Click "Manage" next to mindfulchampion.com
3. Go to "Advanced DNS" tab
4. Click "Add New Record"
5. Select "TXT Record"
6. Enter Host and Value from Resend
7. Save and repeat for all 3 records

#### For **Cloudflare**:
1. Go to: https://dash.cloudflare.com/
2. Select mindfulchampion.com domain
3. Click "DNS" tab
4. Click "Add record"
5. Select "TXT" type
6. Enter Name and Content from Resend
7. Set Proxy status to "DNS only" (gray cloud)
8. Save and repeat for all 3 records

#### For **Google Domains**:
1. Go to: https://domains.google.com/
2. Click on mindfulchampion.com
3. Click "DNS" in left sidebar
4. Scroll to "Custom resource records"
5. Add each TXT record with Name and Value
6. Save

---

### Step 4: Verify Domain in Resend

**After adding DNS records (wait 5-30 minutes for propagation)**:

1. Go back to Resend Domains page: https://resend.com/domains
2. Click on "mindfulchampion.com"
3. Click "Verify" button
4. Resend will check DNS records

**Verification Status**:
- ✅ **Green checkmarks** = DNS records configured correctly
- ❌ **Red X** = DNS records not found or incorrect

**If verification fails**:
- Wait 1-2 hours (DNS can take time to propagate)
- Double-check DNS records match exactly what Resend provided
- Try "Verify" again

---

### Step 5: Remove or Ignore "updates.reai.io" Domain

Once mindfulchampion.com is verified:

**Option 1: Delete updates.reai.io**
1. Go to https://resend.com/domains
2. Click on "updates.reai.io"
3. Click "Delete Domain" (if option available)

**Option 2: Ignore it**
- Resend will use mindfulchampion.com for your FROM addresses
- updates.reai.io will not be used as long as your code uses @mindfulchampion.com

---

## 📧 Email Addresses After Setup

Once mindfulchampion.com domain is verified, these addresses will work:

| Email Address | Purpose | Configuration |
|---------------|---------|---------------|
| `noreply@mindfulchampion.com` | System emails (signups, rewards, notifications) | ✅ Already configured in code |
| `partners@mindfulchampion.com` | Sponsor/partner requests | ✅ Already configured in code |
| `dean@mindfulchampion.com` | Admin communications, support | ✅ Already configured in code |

**No additional code changes needed** - your app is already configured correctly!

---

## 🧪 Testing After Domain Verification

### Test 1: Send Test Email from Admin Dashboard

1. Log in to https://mindfulchampion.com
2. Go to Admin Dashboard (top right menu → "Admin Dashboard")
3. Click "Email Management"
4. Send a test email to `deansnow59@gmail.com`
5. Check your inbox (and spam folder)

### Test 2: Sign Up New User

1. Go to https://mindfulchampion.com
2. Create a new test account
3. Check if welcome email arrives

### Test 3: Check Resend Logs

1. Go to https://resend.com/emails
2. You should see new emails with status "Delivered"
3. No more 422 errors

---

## 🔍 Checking DNS Propagation

**Before clicking "Verify" in Resend, check if DNS records are live:**

### Method 1: Online DNS Checker
Visit: https://mxtoolbox.com/SuperTool.aspx
- Enter: `mindfulchampion.com`
- Click "TXT Lookup"
- You should see the SPF record

### Method 2: Command Line (Mac/Linux)
```bash
# Check SPF record
dig TXT mindfulchampion.com

# Check DKIM record (replace with actual name from Resend)
dig TXT resend._domainkey.mindfulchampion.com

# Check DMARC record
dig TXT _dmarc.mindfulchampion.com
```

### Method 3: Windows Command Prompt
```cmd
nslookup -type=TXT mindfulchampion.com
```

---

## 📊 Current App Configuration (Already Correct)

### Email FROM Addresses in Code
File: `lib/email/config.ts`

```typescript
ACCOUNTS: {
  NOREPLY: {
    email: 'noreply@mindfulchampion.com',  ✅
    name: 'Mindful Champion',
  },
  PARTNERS: {
    email: 'partners@mindfulchampion.com',  ✅
    name: 'Mindful Champion Partners',
  },
  ADMIN: {
    email: 'dean@mindfulchampion.com',  ✅
    name: 'Dean - Mindful Champion',
  },
}
```

**Status**: ✅ All email addresses correctly use @mindfulchampion.com

### Environment Variables
File: Vercel Environment Variables

```
RESEND_API_KEY=re_... ✅ (Already configured)
```

**Status**: ✅ API key is active and working

---

## ❓ FAQ

### Q: Why do I have "updates.reai.io" in my Resend account?
**A**: This might be:
- A leftover from another project
- A test domain
- A domain from a previous Resend account

**Solution**: Once mindfulchampion.com is verified, you can ignore or delete it.

---

### Q: How long does DNS propagation take?
**A**: Usually 5-30 minutes, but can take up to 24-48 hours in rare cases.

**Tip**: Use incognito/private browsing when checking DNS to avoid cached results.

---

### Q: What if I don't know where mindfulchampion.com is registered?
**A**: Check your email for:
- Domain registration confirmation
- Domain renewal notices
- Billing receipts from GoDaddy, Namecheap, etc.

Or use a WHOIS lookup:
- Visit: https://whois.domaintools.com/
- Enter: mindfulchampion.com
- Look for "Registrar" field

---

### Q: Can I use a subdomain like "mail.mindfulchampion.com"?
**A**: No, your code is configured to use @mindfulchampion.com addresses. Using a subdomain would require code changes.

**Recommendation**: Stick with the main domain (mindfulchampion.com).

---

### Q: Do I need to create email accounts for noreply@, partners@, dean@?
**A**: No! Resend acts as your email service provider. You only need to:
1. Verify the domain in Resend
2. Keep the FROM addresses in your code

Resend handles all sending automatically.

---

### Q: What about Google Workspace licenses?
**A**: Good news! You previously reduced from 7 → 6 licenses. Once Resend is working:
- You can keep dean@mindfulchampion.com for receiving emails
- Delete the other 5 Google Workspace accounts
- Save $36/month ($432/year)

**Important**: Resend only sends emails. You still need 1 Google Workspace license (dean@mindfulchampion.com) if you want to receive emails at that address.

---

## 📞 Need Help?

### Resend Support
- Email: support@resend.com
- Docs: https://resend.com/docs
- Community: https://discord.gg/resend

### DNS/Domain Support
- Contact your domain registrar's support team
- Provide them the DNS records from Resend

### App Support
- Dean: dean@mindfulchampion.com
- Check `/admin/emails` page for email logs after domain is verified

---

## ✅ Success Checklist

- [ ] Added mindfulchampion.com domain in Resend dashboard
- [ ] Got 3 DNS records (SPF, DKIM, DMARC) from Resend
- [ ] Added DNS records to domain registrar
- [ ] Waited 30+ minutes for DNS propagation
- [ ] Clicked "Verify" in Resend and got green checkmarks
- [ ] Sent test email from Admin Dashboard
- [ ] Received test email successfully
- [ ] Tested signup flow and received welcome email
- [ ] Checked Resend logs - no more 422 errors
- [ ] Emails show "Delivered" status in Resend

---

## 🎉 What Happens After Domain Verification

1. **Emails Start Working**:
   - Signup emails sent immediately
   - Welcome emails delivered
   - Partner requests sent
   - All system emails functional

2. **No Code Changes Needed**:
   - Your app is already configured correctly
   - FROM addresses use @mindfulchampion.com
   - No deployment required

3. **Better Deliverability**:
   - Emails less likely to go to spam
   - Professional branding (from @mindfulchampion.com)
   - Trusted sender reputation

4. **Resend Logs Show Activity**:
   - Real-time email tracking
   - Delivery confirmations
   - Bounce/spam reports

---

## 📝 Summary

**Current State**:
- ❌ Wrong domain (updates.reai.io) in Resend
- ❌ Emails not working (422 errors)
- ✅ Code correctly configured for @mindfulchampion.com

**Required Action**:
- ✅ Add mindfulchampion.com to Resend dashboard
- ✅ Add 3 DNS records to domain registrar
- ✅ Wait for DNS propagation
- ✅ Verify domain in Resend

**Result**:
- ✅ All emails working from @mindfulchampion.com
- ✅ Professional email delivery
- ✅ No more errors or failed sends
- ✅ Full email functionality restored

---

## 🔗 Quick Links

- **Resend Dashboard**: https://resend.com/overview
- **Add Domain**: https://resend.com/domains
- **Email Logs**: https://resend.com/emails
- **DNS Checker**: https://mxtoolbox.com/SuperTool.aspx
- **WHOIS Lookup**: https://whois.domaintools.com/
- **Admin Email Page**: https://mindfulchampion.com/admin/emails

---

**Last Updated**: December 19, 2025  
**Created For**: Mindful Champion - Dean Snow  
**Status**: Action Required - Domain Not Yet Verified
