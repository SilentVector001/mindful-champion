
# SMS Testing Guide

## Quick Test Instructions

### Prerequisites

1. **Verify Test Phone in Twilio Console:**
   - Go to: https://console.twilio.com
   - Navigate to: Phone Numbers > Manage > Verified Caller IDs
   - Click "Add a new Caller ID"
   - Enter: `+19542348040` (your test phone)
   - Complete the verification process

2. **Ensure Environment Variables are Set:**
   ```bash
   cat .env | grep TWILIO
   ```
   Should show:
   ```
   TWILIO_ACCOUNT_SID=AC... (your Twilio Account SID)
   TWILIO_AUTH_TOKEN=... (your Twilio Auth Token)
   TWILIO_PHONE_NUMBER=+1... (your Twilio Phone Number)
   ```

### Running the Test Script

```bash
cd /home/ubuntu/mindful_champion/nextjs_space
npx tsx scripts/test-sms.ts
```

Expected output:
```
🧪 Testing Mindful Champion SMS Integration
==================================================

📋 Test 1: Checking Twilio Configuration...
✅ Twilio is configured

📋 Test 2: Phone Number Validation...
  9542348040
    Valid: ✅
    Normalized: +19542348040
    Formatted: +1 (954) 234-8040

📋 Test 3: Code Generation...
  6-digit code: 123456
  8-digit code: 12345678
✅ Code generation working

📋 Test 4: Sending Test SMS...
  Attempting to send SMS...
✅ SMS sent successfully!
   Message SID: SM...
   Check your phone at +1 (954) 234-8040

==================================================

📊 Test Summary:
  Twilio Configuration: ✅
  Phone Validation: ✅
  Code Generation: ✅
  SMS Delivery: ✅

🎉 All tests passed! SMS integration is working correctly.
```

### Testing API Endpoints

#### 1. Test SMS Password Reset

```bash
# Request reset code
curl -X POST http://localhost:3000/api/auth/sms/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "9542348040"}'

# Response:
# {
#   "success": true,
#   "message": "Password reset code sent to your phone."
# }

# Check your phone for the 6-digit code, then:
curl -X POST http://localhost:3000/api/auth/sms/verify-and-reset \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "9542348040",
    "code": "123456",
    "newPassword": "newpassword123"
  }'
```

#### 2. Test Phone Verification

First, ensure you're signed in, then:

```bash
# Send verification code
curl -X POST http://localhost:3000/api/auth/sms/send-phone-verification \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"phoneNumber": "9542348040"}'

# Verify phone
curl -X POST http://localhost:3000/api/auth/sms/verify-phone \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"code": "123456"}'
```

#### 3. Test 2FA

```bash
# Enable 2FA
curl -X POST http://localhost:3000/api/auth/2fa/enable \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie"

# Verify and complete enable
curl -X POST http://localhost:3000/api/auth/2fa/verify-and-enable \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"code": "123456"}'

# Send 2FA code during login
curl -X POST http://localhost:3000/api/auth/2fa/send-code \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'

# Verify 2FA code
curl -X POST http://localhost:3000/api/auth/2fa/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "code": "123456"
  }'
```

### Testing in the UI

1. **Test SMS Password Reset:**
   - Go to: `/auth/forgot-password`
   - Click "Reset via SMS" tab
   - Enter: `9542348040`
   - Check phone for code
   - Enter code and new password

2. **Test Phone Verification:**
   - Go to: `/settings/profile`
   - Navigate to "Phone Verification" section
   - Enter: `9542348040`
   - Check phone for code
   - Enter code to verify

3. **Test 2FA:**
   - Go to: `/settings/security`
   - Click "Enable 2FA"
   - Check phone for code
   - Enter code
   - Save backup codes
   - Sign out and sign back in
   - Verify 2FA code during login

### Common Issues and Solutions

#### Issue: "Phone number not verified" error

**Solution:**
1. Verify the number in Twilio Console
2. Or: Use a different verified number for testing

#### Issue: "Rate limit exceeded" error

**Solution:**
Wait 1 hour (rate limit: 5 SMS per hour per number)

#### Issue: SMS not received

**Possible causes:**
1. Phone not verified in Twilio (trial limitation)
2. Wrong phone number format
3. Network delay (wait 30 seconds)
4. Twilio account issue

**Solutions:**
1. Verify number in Twilio Console
2. Check format: `+19542348040`
3. Wait and retry
4. Check Twilio Console logs

#### Issue: Code expired

**Solution:**
Codes expire after 10 minutes. Request a new code.

### Monitoring SMS Delivery

Check Twilio Console for SMS logs:
- Go to: https://console.twilio.com
- Navigate to: Monitor > Logs > Messaging
- View delivery status and errors

### Production Testing Checklist

Before going to production:

- [ ] Upgrade Twilio account (remove trial restrictions)
- [ ] Test with multiple phone numbers
- [ ] Test international numbers (if needed)
- [ ] Test rate limiting behavior
- [ ] Test backup codes for 2FA
- [ ] Test admin SMS controls
- [ ] Review security logs
- [ ] Set up monitoring/alerts
- [ ] Document any custom changes

### Support

If you encounter issues:
1. Check server logs for detailed errors
2. Review Twilio Console for SMS delivery status
3. Verify environment variables are correct
4. Test with verified phone number only (trial mode)
5. Contact Twilio support if needed

---

**Last Updated:** October 24, 2025
**Test Phone:** +1 (954) 234-8040
**Twilio Account:** Trial Mode
