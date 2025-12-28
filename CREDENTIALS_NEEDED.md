# Mindful Champion Credentials Status

## 📋 Credentials Checklist

### ✅ **Already Configured**

#### 1. Gmail App Password (Email Notifications)
- **Status**: ✅ **CONFIGURED**
- **Gmail User**: `welcomefrommc@mindfulchampion.com`
- **App Password**: `your_gmail_app_password_here`
- **Usage**: Email notifications (welcome emails, password resets, sponsor notifications)
- **Test Status**: Ready to use

#### 2. AWS S3 Credentials (Video Storage)
- **Status**: ✅ **CONFIGURED** (Temporary Credentials)
- **Bucket Name**: `abacusai-apps-c23443d20cd3d54c25905c2c-us-west-2`
- **Region**: `us-west-2`
- **Access Key ID**: `ASIA2VBY4LR43KNYQ2CK`
- **Secret Access Key**: `k+pmecRXaYHOiUQ9i0DKVHhwYXcphiljtB2AyvjM`
- **Session Token**: Present (temporary credentials)
- **Expiration**: 2025-12-03 18:11:17 UTC
- **Usage**: Video analysis uploads, user video storage
- **Test Status**: Ready to use

---

## ⚠️ **Important Notes**

### AWS Credentials (Temporary)

The current AWS credentials are **temporary session credentials** that expire on **December 3, 2025 at 6:11 PM UTC**. These are managed by AWS STS (Security Token Service).

**What this means:**
- ✅ Credentials are currently active and working
- ⏰ They will expire in ~5 hours from now
- 🔄 You'll need to refresh them or get permanent credentials

**Options for Production:**

1. **Option A: Get Permanent IAM Credentials** (Recommended)
   - Go to AWS Console → IAM
   - Create a new IAM user specifically for the app
   - Attach `AmazonS3FullAccess` policy
   - Generate access keys (these don't expire)
   - See `CREDENTIAL_SETUP_GUIDE.md` for detailed steps

2. **Option B: Continue with Temporary Credentials**
   - The system will automatically refresh them
   - Requires the credential process to remain accessible
   - Current setup uses `/aws_credentials/.aws/hosted_storage_credential_json`

### Gmail Credentials

The Gmail credentials are **permanent** and do not expire. They are ready to use for:
- Welcome emails to new users
- Password reset emails
- Sponsor application confirmations
- Admin notifications
- Beta tester communications

---

## 🧪 Testing Your Credentials

### Test AWS S3 Connection

```bash
cd /home/ubuntu/mindful_champion/nextjs_space
npm run test-s3
```

### Test Gmail SMTP Connection

```bash
cd /home/ubuntu/mindful_champion/nextjs_space
npm run test-gmail
```

---

## 🚀 For Production Deployment (Vercel)

When deploying to Vercel, you'll need to add these environment variables:

### Required Environment Variables:

```bash
# AWS S3 (for video uploads)
AWS_ACCESS_KEY_ID=your_permanent_access_key_here
AWS_SECRET_ACCESS_KEY=your_permanent_secret_key_here
AWS_REGION=us-west-2
AWS_BUCKET_NAME=abacusai-apps-c23443d20cd3d54c25905c2c-us-west-2
AWS_FOLDER_PREFIX=6482/

# Gmail (for email notifications)
GMAIL_USER=welcomefrommc@mindfulchampion.com
GMAIL_APP_PASSWORD=your_gmail_app_password_here
```

### How to Add to Vercel:

1. Go to your Vercel project dashboard
2. Click on **Settings** → **Environment Variables**
3. Add each variable above
4. Select **Production**, **Preview**, and **Development** environments
5. Click **Save**
6. Redeploy your application

---

## 📝 Summary

| Credential | Status | Action Required |
|------------|--------|----------------|
| **Gmail** | ✅ Configured | None - ready to use |
| **AWS S3** | ✅ Configured (Temporary) | Optional: Get permanent IAM credentials for production |
| **Bucket** | ✅ Exists | None - `abacusai-apps-c23443d20cd3d54c25905c2c-us-west-2` is ready |

---

## 🔗 Additional Resources

- **Detailed Setup Guide**: See `CREDENTIAL_SETUP_GUIDE.md`
- **Interactive Setup**: Run `npm run setup-credentials`
- **AWS Console**: https://console.aws.amazon.com/
- **Gmail App Passwords**: https://myaccount.google.com/apppasswords

---

## ✅ Next Steps

1. **For immediate testing**: Your credentials are already configured and working
2. **For production deployment**: 
   - Copy the environment variables above to Vercel
   - Consider getting permanent AWS IAM credentials (see setup guide)
3. **For verification**: Run the test scripts mentioned above

**Estimated Time**: 5-10 minutes for Vercel setup, 15-20 minutes for permanent AWS credentials
