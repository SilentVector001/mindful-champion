# ElevenLabs API Setup for Coach Kai

## Current Status
✅ Coach Kai has been restored with:
- **Voice**: Mark - Natural Conversations
- **Voice ID**: UgBBYS2sOqTuMpoF3BR0
- **Model**: eleven_multilingual_v2
- **Settings**: 
  - Stability: 0.30 (natural variation)
  - Similarity Boost: 0.70 (emotional expression)
  - Style: 0.70
  - Speaker Boost: ON (enhanced clarity)

## Required: Add Your ElevenLabs API Key

### Step 1: Get Your API Key
1. Go to https://elevenlabs.io/app/settings/api-keys
2. Sign in with your account (dean@mindfulchampion.com)
3. Copy your API key

### Step 2: Add the API Key
Edit the file: `/home/ubuntu/mindful_champion/nextjs_space/.env.local`

Replace the placeholder:
```
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

With your actual API key:
```
ELEVENLABS_API_KEY=sk_abc123...your_actual_key
```

### Step 3: Rebuild and Deploy
After adding the API key, the app will be automatically rebuilt and deployed.

## Testing
1. Go to https://mindfulchampion.com/train/coach
2. Click "Tap to talk" or enable "Call Mode"
3. Speak to Coach Kai and listen to the natural conversation voice

## Subscription Info
- Plan: Creator ($11/month, 50% off first month = $5.50)
- Credits: 100,000 credits (~100 min of speech)
- Email: dean@mindfulchampion.com
