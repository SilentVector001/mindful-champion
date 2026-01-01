# 🚀 Deploy Coach Kai - Fix Connection Error

## Current Issue
Coach Kai shows: "I'm having trouble connecting right now. Please try again in a moment! 🚨"

## Root Cause
The `ABACUSAI_API_KEY` environment variable is either missing or not propagating to your Vercel deployment.

---

## ✅ Solution Steps

### Option 1: Use Your Existing OpenAI Key (Recommended)

Since you already have `OPENAI_API_KEY` in Vercel (from screenshot 6), update the code to use it:

1. **Copy the API key you created** (from screenshot 5):
   - Name: "Mindful Champion Coach Kai"
   - Key starts with: `sk-proj-...`

2. **Add to Vercel Environment Variables**:
   ```
   Go to: Vercel Dashboard → Your Project → Settings → Environment Variables
   
   Add new variable:
   Name:  ABACUSAI_API_KEY
   Value: sk-proj-qMuslNLbQp4wI3WPOp-4eVDbbLq_UE0br_3M4YdcjqYoOle0eHPPVnO_tmmuF8aqI1lo16T1bI1BKFkFj1h_wsvyRUeAQ85rc...
   
   Apply to: Production, Preview, and Development
   ```

3. **Redeploy**:
   - Vercel will automatically redeploy, OR
   - Go to Deployments → Click "Redeploy" on the latest deployment

### Option 2: Use Alternative Key Name

If you want to keep using `OPENAI_API_KEY` (already in Vercel):

1. **Update the code to check for both keys**:
   - Edit `/lib/ai/abacus-client.ts` line 58
   - Change from: `process.env.ABACUSAI_API_KEY`
   - To: `process.env.ABACUSAI_API_KEY || process.env.OPENAI_API_KEY`

2. **Commit and push** the change

3. **Vercel will auto-deploy**

---

## 🔍 Verify It's Working

After deploying, test Coach Kai:

1. Go to your app → Coach Kai
2. Send a test message: "Hey Coach Kai, can you hear me?"
3. ✅ Should respond with coaching advice (not an error)

---

## 💰 Credit Usage Note

From screenshot 2, you have:
- **Remaining Credits**: 20,000 (20K)
- **Used**: 665,351 (665.4K)

With Chat LLM on Abacus.AI Pro ($20/month):
- **You get 25K credits/month per user**
- Each Coach Kai message costs ~250-500 credits
- **You have enough for ~40-80 more Coach Kai conversations this month**
- Credits refresh on: **Jan 18, 2026**

---

## 🎯 Quick Checklist

- [ ] API key copied from Abacus.AI dashboard
- [ ] Added as `ABACUSAI_API_KEY` in Vercel
- [ ] Applied to Production, Preview, Development
- [ ] Redeployed (or waited for auto-deploy)
- [ ] Tested Coach Kai - no connection error
- [ ] Avatar toggle working (if using Simli)

---

## 🆘 Still Having Issues?

### Error: "AI service not configured"
- The API key is not set in Vercel
- Make sure it's spelled: `ABACUSAI_API_KEY` (not `ABACUS_API_KEY`)

### Error: "Coach Kai is temporarily unavailable"
- The API key might be invalid or expired
- Verify the key in your Abacus.AI dashboard → API → API keys

### Error: "timeout" or "taking longer than usual"
- You might be out of credits
- Check your Abacus.AI credits: https://apps.abacus.ai/profile

### Avatar not working but chat works
- Check `SIMLI_API_KEY` and `SIMLI_FACE_ID` are set in Vercel
- From your previous setup: 
  - API Key: `wr2n23svu8fq87uezd5qb8`
  - Face ID: `5fc23ea5-8175-4a82-aaaf-cdd8c88543dc` (Trinity)

---

## 📝 Environment Variables Reference

Your Vercel should have these set (from screenshot 6):

```bash
# Coach Kai / Abacus.AI
ABACUSAI_API_KEY=sk-proj-[your-key-here]

# Simli Avatar (Trinity)
SIMLI_API_KEY=wr2n23svu8fq87uezd5qb8
SIMLI_FACE_ID=5fc23ea5-8175-4a82-aaaf-cdd8c88543dc
NEXT_PUBLIC_SIMLI_API_KEY=wr2n23svu8fq87uezd5qb8

# ElevenLabs TTS
ELEVENLABS_API_KEY=sk_1b4e9864f8a14e7c9f7896b4ac1da801f97e20a7766e7684

# Other (you already have these)
OPENAI_API_KEY=[fallback]
HEYGEN_API_KEY=[if using HeyGen]
```

---

## 🎉 Expected Result

After fixing, Coach Kai should:
- ✅ Respond to messages instantly
- ✅ Provide personalized pickleball coaching
- ✅ Remember conversation context
- ✅ Show the Trinity avatar (if avatar toggle is ON)
- ✅ Speak responses with ElevenLabs voice (if TTS is enabled)

**No more connection errors! 🚀**
