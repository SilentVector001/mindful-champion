# Mindful Champion - Vercel Deployment Guide

## Overview
This guide will help you deploy Mindful Champion to Vercel and configure the custom domain **mindfulchampion.com**.

---

## Prerequisites
- Vercel account (sign up at https://vercel.com if you don't have one)
- GitHub repository connected to your project (or manual deployment via CLI)
- Domain registrar access (NameBright for mindfulchampion.com)

---

## Deployment Methods

### Method 1: Vercel Dashboard (Recommended)

#### Step 1: Connect GitHub Repository
1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select or connect your GitHub repository
4. Set the root directory to: `nextjs_space`
5. Click "Deploy"

#### Step 2: Configure Environment Variables
In the Vercel dashboard, go to **Settings > Environment Variables** and add:

**Required Variables:**
```
DATABASE_URL=postgresql://neondb_owner:npg_ot6vpw5FUenm@ep-autumn-block-a4jw6pd9-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require

NEXTAUTH_SECRET=9qwR8NtHtNaNIlNL4pKS1CTQupo4SCZS
NEXTAUTH_URL=https://mindfulchampion.com

ABACUSAI_API_KEY=19050ea030924f3dbc432d96ecbd0a89

HEYGEN_API_KEY=sk_V2_hgu_k5SScsSroGg_MImIKliTzpJ2ybzwSBu7QyLHcj6563co

ELEVENLABS_API_KEY=sk_341119081c86246051f03f80fc959fcfa2b23d31c8f334ec

TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=37392be756b3418f7cae255c94f5a0a4
TWILIO_PHONE_NUMBER=+18556429735
```

**Optional Variables (if you have them):**
```
RESEND_API_KEY=[your_resend_api_key]
STRIPE_SECRET_KEY=[your_stripe_secret_key]
STRIPE_WEBHOOK_SECRET=[your_stripe_webhook_secret]
```

**For File Uploads (choose one):**

**Option A: Vercel Blob Storage (Recommended for Vercel)**
```
BLOB_READ_WRITE_TOKEN=[from_vercel_storage]
```
- Go to https://vercel.com/storage
- Create a Blob store
- Copy the token and add it as environment variable

**Option B: Your Own AWS S3**
```
AWS_ACCESS_KEY_ID=[your_aws_key]
AWS_SECRET_ACCESS_KEY=[your_aws_secret]
AWS_REGION=us-west-2
AWS_BUCKET_NAME=[your_bucket_name]
AWS_FOLDER_PREFIX=uploads/
```

---

### Method 2: Vercel CLI

#### Step 1: Install and Login
```bash
cd /home/ubuntu/mindful_champion/nextjs_space
npm install -g vercel
vercel login
```

#### Step 2: Deploy
```bash
vercel --prod
```

#### Step 3: Set Environment Variables
```bash
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production
vercel env add ABACUSAI_API_KEY production
vercel env add HEYGEN_API_KEY production
vercel env add ELEVENLABS_API_KEY production
vercel env add TWILIO_ACCOUNT_SID production
vercel env add TWILIO_AUTH_TOKEN production
vercel env add TWILIO_PHONE_NUMBER production
```

---

## Custom Domain Configuration

### Step 1: Add Domain in Vercel
1. Go to your project in Vercel dashboard
2. Navigate to **Settings > Domains**
3. Click "Add Domain"
4. Enter: `mindfulchampion.com`
5. Click "Add"

### Step 2: Configure DNS at NameBright

Vercel will provide you with DNS records. You'll need to add these at NameBright:

**For Root Domain (mindfulchampion.com):**

1. Log into NameBright at https://www.namebright.com
2. Go to **My Account > Domain Manager**
3. Find `mindfulchampion.com` and click **Manage DNS**
4. Add/Update the following records:

**A Record:**
```
Type: A
Host: @
Value: 76.76.21.21
TTL: 3600
```

**CNAME Record (for www):**
```
Type: CNAME
Host: www
Value: cname.vercel-dns.com
TTL: 3600
```

> **Note:** The exact IP address may be different. Use the DNS records provided by Vercel dashboard.

### Step 3: Wait for DNS Propagation
- DNS changes can take 5-60 minutes to propagate
- You can check status at: https://dnschecker.org/#A/mindfulchampion.com
- Vercel will automatically provision SSL certificate once DNS is verified

---

## Verification Checklist

Once deployed, verify these features:

- [ ] Site loads at https://mindfulchampion.com
- [ ] SSL certificate is active (green padlock)
- [ ] User authentication works (login/signup)
- [ ] Coach Kai loads and responds
- [ ] Video analysis upload works
- [ ] Drill library displays correctly
- [ ] Tournament calendar loads
- [ ] Community features work
- [ ] Database reads/writes function

---

## Troubleshooting

### Build Failures
- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Verify Prisma schema has correct binaryTargets

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check if Neon database allows connections from Vercel IPs
- Test connection with: `npx prisma db pull`

### Authentication Not Working
- Ensure NEXTAUTH_URL is set to production domain
- Verify NEXTAUTH_SECRET is set
- Check that callback URLs are configured correctly

### File Upload Issues
- If using Vercel Blob: Check BLOB_READ_WRITE_TOKEN
- If using S3: Verify AWS credentials and bucket permissions

---

## Important Notes

1. **Database Migration:** Vercel will automatically run `prisma generate` via postinstall script
2. **Build Command:** Configured in vercel.json as `npm run build`
3. **Environment:** All environment variables should be set in Vercel dashboard
4. **Region:** Currently set to `iad1` (Washington D.C.) in vercel.json
5. **Function Timeout:** API routes have 300s timeout, pages have 60s

---

## Post-Deployment

### Update NEXTAUTH_URL
After custom domain is verified, ensure `NEXTAUTH_URL` is set to:
```
https://mindfulchampion.com
```

### Test All Features
Run through the verification checklist above.

### Monitor Logs
- View logs in Vercel dashboard under **Deployments > [Your Deployment] > Runtime Logs**
- Check for any errors or warnings

---

## Support

If you encounter issues:
- Check Vercel documentation: https://vercel.com/docs
- Review deployment logs in Vercel dashboard
- Verify all environment variables are set correctly
- Ensure DNS records match Vercel's requirements

---

## Summary

Your Mindful Champion app is ready to deploy to Vercel! Follow the steps above to:
1. Deploy via Vercel dashboard or CLI
2. Set all required environment variables
3. Configure custom domain DNS
4. Verify deployment is working

Good luck with your deployment! 🚀
