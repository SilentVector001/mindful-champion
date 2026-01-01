# Coach Kai Connection Fix Guide

## Problem
Coach Kai returns error: "I'm having trouble connecting right now. Please try again in a moment! 🏓"

## Root Cause
The `ABACUSAI_API_KEY` environment variable is configured locally but **not set in Vercel's production environment**.

## Solution

### Option 1: Add via Vercel Dashboard (Recommended)
1. Go to https://vercel.com/dashboard
2. Select your project: **mindful-champion**
3. Go to **Settings** → **Environment Variables**
4. Add a new variable:
   - **Name**: `ABACUSAI_API_KEY`
   - **Value**: `19050ea030924f3dbc432d96ecbd0a89`
   - **Environments**: Check ✓ Production, ✓ Preview, ✓ Development
5. Click **Save**
6. Go to **Deployments** tab
7. Click the **...** menu on the latest deployment
8. Select **Redeploy** with "Use existing Build Cache" unchecked

### Option 2: Add via Vercel CLI
```bash
cd /home/ubuntu/mindful_champion
vercel env add ABACUSAI_API_KEY production
# When prompted, paste: 19050ea030924f3dbc432d96ecbd0a89

# Also add for preview and development
vercel env add ABACUSAI_API_KEY preview
vercel env add ABACUSAI_API_KEY development

# Trigger a new deployment
vercel --prod
```

## Verification
After deployment completes:
1. Visit https://mindfulchampion.com/train/coach
2. Send a test message: "Hi Coach Kai, can you hear me?"
3. Coach Kai should respond with a proper message (not the error)

## Technical Details
- **API Route**: `/api/coach-kai/chat`
- **Error Location**: `app/api/coach-kai/chat/route.ts` line 23-26
- **Current Check**: Route returns 503 error if `ABACUSAI_API_KEY` is missing
- **Local vs Production**: Local `.env.local` file is not deployed to Vercel

## Success Indicators
✅ Coach Kai responds with actual coaching messages
✅ No "I'm having trouble connecting" error
✅ Streaming responses work properly
✅ Function calling (calendar, drills) works

## If Still Not Working
1. Check Vercel deployment logs for errors
2. Verify the API key is valid (test with Abacus.AI API directly)
3. Check if there are any rate limits or quota issues
4. Ensure the API endpoint `https://apps.abacus.ai/v1/chat/completions` is accessible
