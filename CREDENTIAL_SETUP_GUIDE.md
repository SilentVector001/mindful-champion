# Credential Setup Guide for Mindful Champion

## 📚 Table of Contents

1. [Current Status](#current-status)
2. [AWS S3 Credentials](#aws-s3-credentials)
3. [Gmail App Password](#gmail-app-password)
4. [Vercel Deployment](#vercel-deployment)
5. [Testing & Verification](#testing--verification)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Current Status

### ✅ What's Already Configured

Your Mindful Champion app **already has working credentials** configured!

#### Gmail (Email Notifications)
- ✅ **Gmail User**: `welcomefrommc@mindfulchampion.com`
- ✅ **App Password**: Configured and active
- ✅ **Ready to send**: Welcome emails, password resets, notifications

#### AWS S3 (Video Storage)
- ✅ **S3 Bucket**: `abacusai-apps-c23443d10cd3d54c25905c2c-us-west-2`
- ✅ **Region**: `us-west-2` (Oregon)
- ✅ **Access Keys**: Temporary credentials active
- ✅ **Expiration**: December 3, 2025 at 6:11 PM UTC
- ✅ **Ready for**: Video uploads, user content storage

---

## 🪣 AWS S3 Credentials

### The S3 Bucket is Already Created!

Your bucket `abacusai-apps-c23443d20cd3d54c25905c2c-us-west-2` exists and is ready to use.

### Current Setup (Temporary Credentials)

You're currently using **temporary STS credentials** that:
- ✅ Are working right now
- ⏰ Expire on December 3, 2025 at 6:11 PM UTC
- 🔄 Are automatically refreshed by the system

### Option A: Continue with Temporary Credentials

**Best for**: Development, testing, or if you're hosting on the current platform

**How it works**:
- The system automatically fetches new credentials from `/aws_credentials/.aws/hosted_storage_credential_json`
- No action required - it just works!
- Credentials refresh automatically before expiration

**No setup needed** - you're already using this!

### Option B: Get Permanent IAM Credentials

**Best for**: Production deployment on Vercel, Netlify, or other platforms

#### Step-by-Step Guide:

##### 1. Go to AWS Console

🔗 **Direct Link**: https://console.aws.amazon.com/iamv2/home#/users

Or manually:
1. Go to https://aws.amazon.com
2. Click **Sign In to the Console**
3. Enter your AWS account credentials
4. Navigate to **IAM** (Identity and Access Management)

##### 2. Create a New IAM User

1. Click **Users** in the left sidebar
2. Click **Create user**
3. **User name**: `mindful-champion-s3-access`
4. ✅ Check **Provide user access to the AWS Management Console** (optional)
5. Click **Next**

##### 3. Set Permissions

**Option A: Full S3 Access** (Easiest)
1. Select **Attach policies directly**
2. Search for `AmazonS3FullAccess`
3. ✅ Check the box next to it
4. Click **Next**

**Option B: Bucket-Specific Access** (More Secure)
1. Select **Attach policies directly**
2. Click **Create policy**
3. Use this JSON:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::abacusai-apps-c23443d20cd3d54c25905c2c-us-west-2",
        "arn:aws:s3:::abacusai-apps-c23443d20cd3d54c25905c2c-us-west-2/*"
      ]
    }
  ]
}
```

4. Name it `MindfulChampionS3Access`
5. Create and attach it to the user

##### 4. Generate Access Keys

1. Click on the newly created user
2. Go to **Security credentials** tab
3. Scroll to **Access keys**
4. Click **Create access key**
5. Select **Application running outside AWS**
6. Click **Next** → **Create access key**

##### 5. Save Your Credentials

🚨 **IMPORTANT**: You'll see these once - save them now!

- **Access Key ID**: `AKIA...` (20 characters)
- **Secret Access Key**: (40 characters)

**Save them to**:
- Your password manager
- Your `.env.local` file (for local development)
- Your Vercel environment variables (for production)

**Example**:
```bash
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-west-2
AWS_BUCKET_NAME=abacusai-apps-c23443d20cd3d54c25905c2c-us-west-2
```

---

## 📧 Gmail App Password

### Current Status: ✅ Already Configured!

Your Gmail is already set up:
- **Email**: `welcomefrommc@mindfulchampion.com`
- **App Password**: `your_gmail_app_password_here`

### If You Need to Create a New One

#### Prerequisites:
- ✅ Gmail account
- ✅ 2-Factor Authentication (2FA) enabled

#### Step-by-Step Guide:

##### Step 1: Enable 2-Factor Authentication (if not already)

1. Go to: https://myaccount.google.com/security
2. Click **2-Step Verification**
3. Follow the wizard to set up 2FA
4. Use your phone number or authenticator app

##### Step 2: Generate App Password

1. **Direct Link**: https://myaccount.google.com/apppasswords
2. Sign in if prompted
3. In the "App name" field, type: `Mindful Champion`
4. Click **Create**
5. Google will show you a **16-character code** like: `abcd efgh ijkl mnop`
6. **Copy it immediately** (you can't see it again!)

**Important**: Remove spaces when saving:
- ✅ Correct: `abcdefghijklmnop`
- ❌ Wrong: `abcd efgh ijkl mnop`

##### Step 3: Save to Environment Variables

```bash
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
```

### Troubleshooting

#### "App Passwords" option not available?

1. **Cause**: 2FA is not enabled
2. **Fix**: Enable 2-Step Verification first (see Step 1)

#### "Less secure app access" message?

1. **Cause**: You're using the wrong setting
2. **Fix**: Use "App passwords" instead (not "Less secure apps")

#### Emails not sending?

1. **Check**: Gmail credentials are correct
2. **Check**: No typos in the app password
3. **Check**: 2FA is still enabled
4. **Test**: Use the test script: `npm run test-gmail`

---

## 🚀 Vercel Deployment

### How to Add Environment Variables to Vercel

#### Step 1: Go to Your Project Settings

1. Log in to https://vercel.com
2. Select your Mindful Champion project
3. Click **Settings** (top navigation)
4. Click **Environment Variables** (left sidebar)

#### Step 2: Add AWS S3 Credentials

**Add these variables one by one**:

1. **Variable Name**: `AWS_ACCESS_KEY_ID`
   - **Value**: Your permanent access key (e.g., `AKIAIOSFODNN7EXAMPLE`)
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development
   - Click **Save**

2. **Variable Name**: `AWS_SECRET_ACCESS_KEY`
   - **Value**: Your secret access key
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development
   - Click **Save**

3. **Variable Name**: `AWS_REGION`
   - **Value**: `us-west-2`
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development
   - Click **Save**

4. **Variable Name**: `AWS_BUCKET_NAME`
   - **Value**: `abacusai-apps-c23443d20cd3d54c25905c2c-us-west-2`
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development
   - Click **Save**

5. **Variable Name**: `AWS_FOLDER_PREFIX`
   - **Value**: `6482/`
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development
   - Click **Save**

#### Step 3: Add Gmail Credentials

1. **Variable Name**: `GMAIL_USER`
   - **Value**: `welcomefrommc@mindfulchampion.com`
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development
   - Click **Save**

2. **Variable Name**: `GMAIL_APP_PASSWORD`
   - **Value**: `your_gmail_app_password_here`
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development
   - Click **Save**

#### Step 4: Trigger Redeployment

1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **Redeploy** (three dots menu)
4. Click **Redeploy**

**Wait**: 2-5 minutes for the new deployment to complete

---

## 🧪 Testing & Verification

### Test AWS S3 Connection

```bash
cd /home/ubuntu/mindful_champion/nextjs_space
node scripts/test-s3-connection.js
```

**Expected Output**:
```
✅ S3 Connection Successful!
Bucket: abacusai-apps-c23443d20cd3d54c25905c2c-us-west-2
Region: us-west-2
Test file uploaded successfully
```

### Test Gmail SMTP Connection

```bash
cd /home/ubuntu/mindful_champion/nextjs_space
node scripts/test-gmail-connection.js
```

**Expected Output**:
```
✅ Gmail Connection Successful!
Email: welcomefrommc@mindfulchampion.com
Test email sent successfully
```

### Manual Testing

#### Test Video Upload

1. Go to your deployed app
2. Sign in
3. Navigate to `/train/video`
4. Upload a test video
5. ✅ **Success**: Video uploads and shows in library
6. ❌ **Failure**: Check AWS credentials

#### Test Email Sending

1. Go to your deployed app
2. Try signing up with a new email
3. Check your inbox for welcome email
4. ✅ **Success**: Email received
5. ❌ **Failure**: Check Gmail credentials

---

## ❓ Troubleshooting

### AWS S3 Issues

#### "Access Denied" error

**Cause**: IAM user doesn't have S3 permissions

**Fix**:
1. Go to AWS Console → IAM → Users
2. Click on your user
3. Click **Add permissions**
4. Attach `AmazonS3FullAccess` policy

#### "Bucket does not exist" error

**Cause**: Bucket name is wrong

**Fix**:
1. Double-check bucket name: `abacusai-apps-c23443d20cd3d54c25905c2c-us-west-2`
2. Make sure there are no extra spaces

#### "Invalid credentials" error

**Cause**: Access keys are wrong or expired

**Fix**:
1. Go to AWS Console → IAM → Users → Security credentials
2. Create new access keys
3. Update your environment variables

### Gmail Issues

#### "Invalid login" error

**Cause**: App password is wrong or 2FA is disabled

**Fix**:
1. Go to https://myaccount.google.com/apppasswords
2. Generate a new app password
3. Update `GMAIL_APP_PASSWORD`

#### "Authentication failed" error

**Cause**: Gmail user is wrong

**Fix**:
1. Check `GMAIL_USER` matches your Gmail address
2. Make sure there are no typos

---

## 📝 Security Best Practices

### ✅ Do:
- Store credentials in environment variables
- Use `.env.local` for local development (never commit!)
- Use Vercel's environment variables for production
- Rotate access keys every 90 days
- Use IAM users with minimum required permissions

### ❌ Don't:
- Commit credentials to Git
- Share credentials in plain text
- Use root AWS account credentials
- Give full admin access when S3 access is enough

---

## 📊 Summary

| Task | Status | Time Estimate |
|------|--------|---------------|
| Gmail Setup | ✅ Already Done | 0 minutes |
| AWS S3 (Current) | ✅ Already Done | 0 minutes |
| AWS IAM (Permanent) | 📝 Optional | 15-20 minutes |
| Vercel Deployment | 📝 Needed | 5-10 minutes |
| Testing | 📝 Recommended | 5 minutes |

**Total Time**: 5-35 minutes (depending on what you need)

---

## 🎉 Next Steps

1. **For immediate use**: Your credentials are already working!
2. **For Vercel**: Copy the environment variables to Vercel settings
3. **For long-term**: Consider getting permanent AWS IAM credentials
4. **For verification**: Run the test scripts

**Need help?** All the direct links and commands are provided above!
