# DNS Configuration for mindfulchampion.com

## NameBright DNS Setup Instructions

Once you've deployed to Vercel and added your custom domain, you'll need to update your DNS records at NameBright.

---

## Step-by-Step Instructions

### 1. Get DNS Records from Vercel

After adding `mindfulchampion.com` as a custom domain in Vercel:
1. Go to your project settings in Vercel
2. Navigate to **Domains** section
3. You'll see DNS configuration instructions showing:
   - An **A record** for the root domain
   - A **CNAME record** for www subdomain

### 2. Login to NameBright

1. Go to https://www.namebright.com
2. Click **Sign In** (top right)
3. Enter your credentials

### 3. Access DNS Management

1. Click **My Account** in the top menu
2. Select **Domain Manager**
3. Find `mindfulchampion.com` in your domain list
4. Click the **Manage DNS** or **DNS** button next to the domain

### 4. Configure DNS Records

#### For Root Domain (@):

**A Record:**
```
Type:     A
Host:     @ (or leave blank for root)
Points to: 76.76.21.21
TTL:      3600 (or Auto)
```

> ⚠️ **Important:** The IP address above is Vercel's standard A record IP. However, Vercel may show you a different IP in your dashboard. **Use the IP provided by Vercel** if it differs.

#### For WWW Subdomain:

**CNAME Record:**
```
Type:     CNAME
Host:     www
Points to: cname.vercel-dns.com
TTL:      3600 (or Auto)
```

### 5. Remove Conflicting Records

**IMPORTANT:** Before adding new records, remove any existing records that might conflict:

- Remove any existing **A records** pointing to other IPs
- Remove any existing **CNAME records** for the root domain (@)
- Remove any **AAAA records** (IPv6) if present
- Keep only the new Vercel records

### 6. Save Changes

1. Click **Save** or **Update** to apply changes
2. DNS changes typically propagate within **15-60 minutes**
3. Some changes may be immediate, others can take up to 24 hours

---

## Verification

### Check DNS Propagation

Use these tools to verify your DNS changes:

1. **DNS Checker:** https://dnschecker.org
   - Enter: `mindfulchampion.com`
   - Select: A record
   - Should show: `76.76.21.21` globally

2. **What's My DNS:** https://www.whatsmydns.net
   - Enter: `mindfulchampion.com`
   - Type: A
   - Should propagate worldwide within an hour

3. **Command Line Check:**
   ```bash
   dig mindfulchampion.com
   dig www.mindfulchampion.com
   ```

### Expected Results:

**For mindfulchampion.com:**
```
mindfulchampion.com.    3600    IN    A    76.76.21.21
```

**For www.mindfulchampion.com:**
```
www.mindfulchampion.com.    3600    IN    CNAME    cname.vercel-dns.com.
```

---

## SSL Certificate

Vercel will automatically provision a **Let's Encrypt SSL certificate** once:
1. DNS records are verified
2. Domain ownership is confirmed

This usually takes **5-15 minutes** after DNS propagation.

You'll see:
- ✅ **Valid Certificate** in Vercel dashboard
- 🔒 **Green padlock** when visiting https://mindfulchampion.com

---

## Troubleshooting

### DNS Not Propagating
- Wait 15-60 minutes after making changes
- Clear your browser cache: `Ctrl+Shift+Del` (or `Cmd+Shift+Del` on Mac)
- Try incognito/private browsing mode
- Check DNS at https://dnschecker.org

### SSL Certificate Not Issuing
- Ensure DNS is fully propagated (check dnschecker.org)
- Verify A record points to correct Vercel IP
- Wait 15 minutes and refresh Vercel dashboard
- If still failing, try removing and re-adding the domain

### "Invalid Configuration" Error in Vercel
- Double-check DNS records match exactly
- Ensure no conflicting records exist
- Verify domain is not locked or in pending transfer

### Site Showing 404 or Old Content
- Clear browser cache
- Try different browser or incognito mode
- Verify deployment is successful in Vercel
- Check that NEXTAUTH_URL is set to `https://mindfulchampion.com`

---

## Alternative: Using Vercel Nameservers (Optional)

If you want Vercel to manage all DNS for your domain:

1. **In Vercel Dashboard:**
   - Go to Domains settings
   - Look for "Use Vercel Nameservers" option
   - Note the nameservers provided (e.g., `ns1.vercel-dns.com`)

2. **In NameBright:**
   - Go to domain management
   - Find "Nameservers" section
   - Change from NameBright nameservers to Vercel's
   - Save changes

⚠️ **Warning:** This will transfer ALL DNS control to Vercel, including email records if you have any.

---

## Final Checklist

Before considering DNS setup complete:

- [ ] A record added for root domain (@)
- [ ] CNAME record added for www
- [ ] Old/conflicting records removed
- [ ] Changes saved in NameBright
- [ ] DNS propagation verified at dnschecker.org
- [ ] SSL certificate issued in Vercel (green checkmark)
- [ ] Site loads at https://mindfulchampion.com
- [ ] Site loads at https://www.mindfulchampion.com
- [ ] Both URLs show green padlock (SSL active)
- [ ] Site functions correctly (login, features, etc.)

---

## Support Resources

- **Vercel DNS Docs:** https://vercel.com/docs/concepts/projects/domains
- **NameBright Support:** https://www.namebright.com/Support
- **DNS Troubleshooting:** https://vercel.com/docs/concepts/projects/domains/troubleshooting

---

## Quick Reference

**Vercel A Record IP:** `76.76.21.21`  
**Vercel CNAME:** `cname.vercel-dns.com`  
**Your Domain:** `mindfulchampion.com`  
**Registrar:** NameBright  
**TTL:** 3600 seconds (1 hour)  

---

Good luck with your deployment! 🚀
