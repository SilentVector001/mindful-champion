# Cache Clear Guide for MindfulChampion.com

## Issue Summary
You're seeing the **old HeyGen-based Coach Kai** interface on your device, but the **new text-based Coach Kai** is actually deployed and working correctly on the live site.

## Verification
✅ **Confirmed:** The new TextCoachKai component is live at https://www.mindfulchampion.com/train/coach

### What You Should See (New Version):
- **Header:** "COACH KAI" with "AI COACH" and "BETA" badges
- **Status:** "✓ Ready" indicator
- **Voice Toggle:** "Voice Off" button in top right
- **PTT Feature:** Large microphone icon with "Hold to Talk" text
- **Text Input:** "What's on your mind?" input field with send button
- **Quick Actions:** Four buttons at bottom (Serve Help, Footwork, Mental Game, Strategy)
- **NO:** Video avatar, "Connecting..." message, or "Video avatar uses HeyGen credits" text

### What You're Seeing (Old Cached Version):
- Video player area with "Connecting..." status
- "Video avatar uses HeyGen credits • Text chat is always free" message
- HeyGen integration UI elements

## Root Cause
This is a **browser caching issue**. Your browser has stored the old version of the page and is serving that instead of fetching the new version from Vercel.

---

## How to Fix: Clear Your Browser Cache

### For Chrome (Desktop):

#### Method 1: Hard Refresh (Quickest)
1. Go to https://www.mindfulchampion.com/train/coach
2. Press **Ctrl+Shift+R** (Windows/Linux) or **Cmd+Shift+R** (Mac)
3. This forces Chrome to bypass the cache and reload everything

#### Method 2: Clear Cached Images and Files
1. Press **Ctrl+Shift+Delete** (Windows/Linux) or **Cmd+Shift+Delete** (Mac)
2. Select **"Cached images and files"**
3. Change time range to **"All time"**
4. Click **"Clear data"**
5. Reload the page

#### Method 3: Clear All Site Data (Nuclear Option)
1. Click the **padlock icon** in the address bar
2. Click **"Site settings"**
3. Scroll down and click **"Clear data"**
4. Reload the page (you'll need to log in again)

### For Safari (Mac/iOS):

#### Safari Desktop:
1. Go to **Safari > Settings** (or Preferences)
2. Click **"Advanced"** tab
3. Enable **"Show Develop menu in menu bar"**
4. Go to **Develop > Empty Caches**
5. Or press **Option+Cmd+E**
6. Reload the page with **Cmd+R**

#### Safari iOS (iPhone/iPad):
1. Go to **Settings > Safari**
2. Scroll down and tap **"Clear History and Website Data"**
3. Confirm by tapping **"Clear History and Data"**
4. Reopen Safari and visit the site

### For Firefox:

1. Press **Ctrl+Shift+Delete** (Windows/Linux) or **Cmd+Shift+Delete** (Mac)
2. Select **"Cache"** and **"Cookies"**
3. Change time range to **"Everything"**
4. Click **"Clear Now"**
5. Reload the page

### For Edge:

1. Press **Ctrl+Shift+Delete**
2. Select **"Cached images and files"** and **"Cookies and other site data"**
3. Change time range to **"All time"**
4. Click **"Clear now"**
5. Reload the page

---

## Verification After Clearing Cache

After clearing your cache, you should see:

1. **Green teal header** with Coach Kai's "K" avatar
2. **"Talk to Coach Kai"** section with microphone icon
3. **PTT (Push-To-Talk)** functionality with "Hold to Talk" label
4. **Text input field** for typing messages
5. **Quick action buttons** at the bottom (Serve Help, Footwork, Mental Game, Strategy)
6. **NO video player or "Connecting..." message**

---

## If the Issue Persists

If you still see the old version after clearing cache:

### 1. Check Your Browser Extensions
- Disable any caching or performance extensions temporarily
- Ad blockers or privacy extensions might cache pages

### 2. Try Incognito/Private Mode
- Open an Incognito window (Ctrl+Shift+N in Chrome)
- Visit https://www.mindfulchampion.com/train/coach
- If it works here, it confirms a caching issue in your regular browser

### 3. Try a Different Browser
- Open the site in a different browser you don't normally use
- If it works there, clear cache more thoroughly in your main browser

### 4. Check Your Device DNS Cache
#### Windows:
```cmd
ipconfig /flushdns
```

#### Mac:
```bash
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

#### Linux:
```bash
sudo systemd-resolve --flush-caches
```

---

## Technical Details (For Reference)

- **Deployed Version:** Commit `3c49d6d` (27 minutes ago as of this check)
- **Coach Kai Component:** `components/coach/text-coach-kai.tsx`
- **Route:** `app/train/coach/page.tsx` renders `<TextCoachKai />`
- **HeyGen Removal:** Commit `dbe3303` successfully removed all HeyGen dependencies
- **Vercel Status:** ✅ Successfully deployed with latest code
- **DNS Status:** ✅ Properly configured with Vercel nameservers

---

## Why This Happened

1. **Aggressive Browser Caching:** Modern browsers cache React/Next.js applications heavily for performance
2. **Service Workers:** PWAs and service workers can cache entire pages
3. **CDN Edge Caching:** Vercel's edge network may have cached the old version briefly
4. **DNS Propagation:** Recent DNS changes to Vercel nameservers (ns1.vercel-dns.com, ns2.vercel-dns.com)

The good news: **The deployment is correct and working!** You just need to clear your local cache to see it.

---

## Quick Test

Run this in your browser's console (F12 > Console tab):
```javascript
console.log(window.location.href);
fetch('/train/coach').then(r => r.text()).then(html => 
  console.log(html.includes('TextCoachKai') ? '✅ NEW VERSION' : '❌ CACHED VERSION')
);
```

This will tell you if you're getting the new version from the server.

---

**Last Verified:** January 1, 2026, 3:59 AM (via screenshot)
**Status:** ✅ New Coach Kai is LIVE and working correctly
