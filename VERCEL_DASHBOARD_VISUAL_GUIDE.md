# 📸 Vercel Dashboard Visual Guide (2026 UI)

## 🎯 Where to Click to Add Your Domain

### **Step-by-Step with Visual Cues**

---

## 1️⃣ Open Vercel Dashboard

**URL:** https://vercel.com/dashboard

```
┌─────────────────────────────────────────────────────────┐
│  Vercel                                        [Profile] │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Overview  Projects  Integrations  Settings              │
│  ────────                                                 │
│                                                           │
│  🔍 Search projects...                                   │
│                                                           │
│  📁 nextjs_space                                ← CLICK  │
│     dean-snows-projects                                  │
│     Production: ● Ready                                  │
│     https://nextjsspace-ochre.vercel.app                │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

**What to do:**
- Click on **"nextjs_space"** project card

---

## 2️⃣ Project Settings Tab

After clicking the project, you'll see:

```
┌─────────────────────────────────────────────────────────┐
│  < Dashboard  /  nextjs_space                [Profile]  │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Deployments  Analytics  Settings  Logs  ← CLICK HERE   │
│                          ────────                         │
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Latest Deployment                               │    │
│  │  ● Ready  3m ago                                 │    │
│  │  https://nextjsspace-es3ttsd1i-...vercel.app   │    │
│  └─────────────────────────────────────────────────┘    │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

**What to do:**
- Click on **"Settings"** tab at the top

---

## 3️⃣ Domains Section

In the Settings page, look at the left sidebar:

```
┌─────────────────────────────────────────────────────────┐
│  Settings                                                 │
├──────────────┬──────────────────────────────────────────┤
│              │                                            │
│  General     │  Domains                                  │
│  Domains     │  ═══════                                  │
│  ═══════  ← CLICK                                       │
│  Environment │  Add a domain to your project            │
│  Variables   │                                            │
│  Git         │  ┌──────────────────────────────────┐    │
│  Cron Jobs   │  │  mindfulchampion.com       [Add] │    │
│  Edge Config │  └──────────────────────────────────┘    │
│  Redirects   │                                            │
│  Logs        │  Or add via CLI:                          │
│  Security    │  $ vercel domains add mindfulchampion.com │
│  Advanced    │                                            │
│              │  No domains configured yet               │
│              │                                            │
└──────────────┴──────────────────────────────────────────┘
```

**What to do:**
- Click on **"Domains"** in the left sidebar
- You'll see a text input field

---

## 4️⃣ Add Domain Input

```
┌─────────────────────────────────────────────────────────┐
│  Domains                                                  │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Add Domain                                              │
│                                                           │
│  ┌───────────────────────────────────────┐              │
│  │  mindfulchampion.com             [Add]│  ← TYPE HERE │
│  └───────────────────────────────────────┘              │
│                                                           │
│  💡 Tip: You can add multiple domains                    │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

**What to do:**
1. Type: `mindfulchampion.com`
2. Click **"Add"** button

---

## 5️⃣ DNS Configuration Choice

After clicking "Add", you'll see this popup:

```
┌─────────────────────────────────────────────────────────┐
│  Configure DNS for mindfulchampion.com                   │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  How would you like to configure DNS?                    │
│                                                           │
│  ◉ Use External Nameservers (Recommended)  ← SELECT     │
│     Use nameservers from your domain registrar           │
│                                                           │
│  ○ Transfer Domain to Vercel                            │
│     Transfer domain management to Vercel                 │
│                                                           │
│                               [Cancel]  [Continue]  ←    │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

**What to do:**
1. Select **"Use External Nameservers"**
2. Click **"Continue"**

---

## 6️⃣ Nameserver Instructions

Vercel will show you this screen:

```
┌─────────────────────────────────────────────────────────┐
│  Configure DNS for mindfulchampion.com                   │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ✅ Step 1: Update Nameservers at NameBright            │
│                                                           │
│  Add these nameservers to your domain:                   │
│                                                           │
│  ┌───────────────────────────────────────┐              │
│  │  ns1.vercel-dns.com            [Copy] │              │
│  └───────────────────────────────────────┘              │
│  ┌───────────────────────────────────────┐              │
│  │  ns2.vercel-dns.com            [Copy] │              │
│  └───────────────────────────────────────┘              │
│                                                           │
│  ✅ You've already done this! (seen in your screenshot) │
│                                                           │
│  ⏱️ DNS propagation: 5-60 minutes                       │
│                                                           │
│                     [Verify DNS]  ← CLICK AFTER 5 MIN    │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

**What to do:**
1. Since you've already added nameservers to NameBright ✅
2. Wait **5-10 minutes**
3. Click **"Verify DNS"**

---

## 7️⃣ Verification Success

After DNS verification succeeds:

```
┌─────────────────────────────────────────────────────────┐
│  Domains                                                  │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ✅ mindfulchampion.com                                  │
│     DNS: Verified                                        │
│     Status: Active                                       │
│     Production: Yes                                      │
│                                                           │
│     ┌─────────────────────────────────────┐             │
│     │  Visit: mindfulchampion.com    [🔗] │             │
│     └─────────────────────────────────────┘             │
│                                                           │
│  Now add www subdomain:                                  │
│  ┌───────────────────────────────────────┐              │
│  │  www.mindfulchampion.com         [Add]│              │
│  └───────────────────────────────────────┘              │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

**What to do:**
- Repeat for **www.mindfulchampion.com**
- Vercel will automatically set it as an alias

---

## 🚨 If You Can't Find "Domains" Tab

### **Alternative 1: Project Overview**

Some Vercel accounts show domains differently:

```
┌─────────────────────────────────────────────────────────┐
│  nextjs_space                                             │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Deployments  Analytics  Settings                        │
│                                                           │
│  🌐 Domains                            [+ Add Domain] ←  │
│  ═══════════                                             │
│                                                           │
│  No domains configured                                   │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

**Look for:**
- 🌐 **Domains** section on the main project page
- Or a **"+ Add Domain"** button near the top

### **Alternative 2: Use CLI (Always Works)**

If the UI is confusing, just use terminal commands:

```bash
# 1. Navigate to your project
cd /home/ubuntu/mindful_champion/nextjs_space

# 2. Add the domain
npx vercel domains add mindfulchampion.com \
  --token 7hAqySfpVwVrqHRk0vIZKDUJ

# 3. Add www subdomain
npx vercel domains add www.mindfulchampion.com \
  --token 7hAqySfpVwVrqHRk0vIZKDUJ

# 4. Check status
npx vercel domains ls --token 7hAqySfpVwVrqHRk0vIZKDUJ
```

---

## 🔍 What "Verified" Looks Like

When DNS is fully configured, you'll see:

```
┌─────────────────────────────────────────────────────────┐
│  Domains for nextjs_space                                 │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ✅ mindfulchampion.com                                  │
│     DNS: ns1.vercel-dns.com, ns2.vercel-dns.com         │
│     Status: Active                                       │
│     Redirect: → www.mindfulchampion.com                 │
│                                                           │
│  ✅ www.mindfulchampion.com                              │
│     DNS: ns1.vercel-dns.com, ns2.vercel-dns.com         │
│     Status: Active                                       │
│     Production: Yes                                      │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Visual Checklist

Use this to confirm you're in the right place:

- [ ] I'm logged in to Vercel
- [ ] I can see "nextjs_space" in my projects
- [ ] I clicked on the project name
- [ ] I see tabs: Deployments, Analytics, Settings, Logs
- [ ] I clicked "Settings"
- [ ] I see "Domains" in the left sidebar
- [ ] I see an input field to add a domain
- [ ] I typed "mindfulchampion.com"
- [ ] I clicked "Add"
- [ ] I selected "Use External Nameservers"
- [ ] I clicked "Continue"
- [ ] I see nameservers: ns1.vercel-dns.com, ns2.vercel-dns.com
- [ ] I waited 5-10 minutes
- [ ] I clicked "Verify DNS"
- [ ] I see ✅ next to my domain

---

## 📸 Take Screenshots If Stuck

If your Vercel UI looks different:

1. **Take a screenshot of:**
   - Your project overview page
   - Your settings page
   - Any error messages

2. **Share screenshots so I can provide exact guidance**

---

## 🎉 Success Indicators

**You'll know it worked when:**

1. **In Vercel:**
   - ✅ Green checkmark next to mindfulchampion.com
   - "Status: Active" shows under domain

2. **In Browser:**
   - https://www.mindfulchampion.com loads the NEW interface
   - No "Connecting..." errors in Coach Kai
   - PTT button appears in Coach Kai

3. **DNS Check:**
   - https://www.whatsmydns.net/#A/mindfulchampion.com
   - Shows Vercel IP (NOT 76.76.21.21)

---

## ⏱️ Timeline After Adding Domain

| Time | What to Expect |
|------|----------------|
| **Immediate** | Domain shows "Pending" in Vercel |
| **2-5 min** | Vercel generates DNS records |
| **5-10 min** | "Verify DNS" button becomes active |
| **10-15 min** | Domain shows "Active" status |
| **15-30 min** | www.mindfulchampion.com starts working |
| **30-60 min** | Full propagation for most users |
| **24-48 hrs** | Complete global propagation |

---

## 🚀 Pro Tips

### **Tip 1: Use Incognito Mode**
Test in an incognito/private window to avoid browser cache issues

### **Tip 2: Test Direct URL First**
Before waiting for DNS, verify the app works:
https://nextjsspace-ochre.vercel.app

### **Tip 3: Check DNS Propagation**
Use this tool to see propagation progress:
https://www.whatsmydns.net/#A/mindfulchampion.com

### **Tip 4: Clear Browser Cache**
After DNS propagates:
- Chrome: Ctrl+Shift+Del (Windows) or Cmd+Shift+Del (Mac)
- Clear "Cached images and files"

---

## 📞 Still Stuck?

If the Vercel UI doesn't match these instructions:

1. **Try the CLI method** (always reliable)
2. **Take a screenshot** of your Vercel dashboard
3. **Share the screenshot** for specific guidance
4. **Check Vercel's docs:** https://vercel.com/docs/concepts/projects/domains

---

**Last Updated:** January 1, 2026, 4:55 AM
**Vercel CLI Version:** 50.1.3
**Next Step:** Add domain in Vercel dashboard or use CLI
