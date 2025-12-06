# 🏆 Rewards Center - Complete Implementation Guide

## Overview

The Rewards Center is a comprehensive 3-tiered reward system with sponsor integration, email notifications, and Apple-style celebration effects. Users earn points through activities and unlock exclusive rewards as they progress through Bronze, Silver, and Gold tiers.

---

## ✨ Key Features

### 1. **3-Tier Reward System**
- **Bronze Champion** (0-999 points)
  - Entry-level rewards
  - Beginner equipment discounts
  - Community support access
  
- **Silver Warrior** (1,000-4,999 points)
  - Premium equipment discounts (up to 30% off)
  - Free tournament entry vouchers
  - Priority customer support
  - Quarterly sponsor gifts

- **Gold Master** (5,000+ points)
  - Elite rewards (up to 50% off)
  - VIP tournament access
  - Free coaching sessions
  - Personalized sponsor partnerships
  - White glove customer service

### 2. **Automatic Tier Unlock Detection**
- Real-time detection when users cross tier thresholds
- Automatic email notifications
- Celebration modal with confetti effects
- Progress tracking to next tier

### 3. **Email Notifications**
- Beautiful HTML emails on tier unlock
- Tier-specific colors and branding
- Benefits listing
- Next tier progress teaser
- Quick action links

### 4. **Apple-Style Celebration Effects**
- Full-screen confetti animation
- Smooth entrance/exit transitions
- Tier-specific color schemes
- Progress visualization
- Mobile-responsive design

### 5. **Comprehensive Rewards UI**
- Current tier status dashboard
- Points balance display
- Progress bar to next tier
- All 3 tiers with lock/unlock states
- Featured sponsor offers
- How to earn points guide

---

## 📁 File Structure

### Database Schema
```
prisma/schema.prisma
  └── New Models:
      ├── RewardTier (Bronze/Silver/Gold configurations)
      ├── TieredReward (Rewards per tier)
      └── TierUnlock (User unlock tracking)
```

### API Routes
```
app/api/rewards/
  ├── check-unlock/route.ts      # Check for new tier unlocks
  ├── celebration-shown/route.ts # Mark celebration as viewed
  └── current-tier/route.ts      # Get user's current tier & progress
```

### Components
```
app/components/
  └── tier-unlock-celebration.tsx # Apple-style celebration modal

app/rewards/
  └── page.tsx                    # Main rewards center UI
```

### Email Templates
```
lib/email/
  └── reward-tier-unlock-email.ts # Tier unlock notification email
```

### Utilities
```
lib/rewards/
  └── award-points.ts             # Point awarding & tier checking
```

### Seed Scripts
```
scripts/
  ├── seed-reward-tiers.ts        # Populate 3 tiers
  └── seed-tiered-rewards.ts      # Populate sample rewards
```

---

## 🚀 Getting Started

### 1. Database Setup

The schema has been updated and pushed. To verify:

```bash
cd /home/ubuntu/mindful_champion/nextjs_space
yarn prisma generate
yarn prisma db push
```

### 2. Seed Data

Populate the tiers and rewards:

```bash
# Seed the 3 reward tiers
npx tsx --require dotenv/config scripts/seed-reward-tiers.ts

# Seed sample rewards (optional, for demo)
npx tsx --require dotenv/config scripts/seed-tiered-rewards.ts
```

### 3. Test the Flow

#### Award Points to a User

Use the utility function in your code:

```typescript
import { awardPoints } from '@/lib/rewards/award-points';

// Award 1000 points (should unlock Silver tier)
await awardPoints(userId, 1000, 'Completed achievement');
```

#### Manual Testing

1. **Login as a user**
2. **Navigate to**: `/rewards`
3. **Check current tier status**
4. **Award points** via achievements or admin panel
5. **Watch for**:
   - Automatic tier unlock detection
   - Email notification
   - Celebration modal with confetti
6. **Browse rewards** in marketplace

---

## 🎨 UI Components

### Rewards Center Page

**URL**: `/rewards`

**Features**:
- Current tier status card
- Points balance
- Progress to next tier
- All 3 tier cards (locked/unlocked states)
- Featured sponsor offers
- How to earn points guide

### Tier Unlock Celebration Modal

**Component**: `TierUnlockCelebration`

**Triggers**: Automatically when user unlocks a new tier

**Features**:
- 80 confetti particles with tier colors
- Animated tier icon
- Benefits list
- Next tier progress
- Smooth transitions
- Mobile responsive

---

## 📧 Email Notifications

### Tier Unlock Email

**Template**: `lib/email/reward-tier-unlock-email.ts`

**Triggered**: When user crosses tier threshold

**Contains**:
- Congratulations header
- Tier badge
- Points earned
- Full benefits list
- Next tier teaser
- Quick action links

**Styling**:
- Tier-specific colors
- Responsive design
- Modern gradient backgrounds
- Mobile-friendly

---

## 🔌 API Endpoints

### POST `/api/rewards/check-unlock`

Checks if user has unlocked any new tiers.

**Returns**:
```json
{
  "hasNewUnlocks": true,
  "unlocks": [
    {
      "id": "unlock_id",
      "tier": {
        "displayName": "Silver Warrior",
        "icon": "🥈",
        "colorPrimary": "#C0C0C0",
        "benefits": [...],
        "nextTierName": "Gold Master",
        "nextTierPoints": 5000
      },
      "pointsAtUnlock": 1000
    }
  ]
}
```

### POST `/api/rewards/celebration-shown`

Marks celebration as shown for a tier unlock.

**Body**:
```json
{
  "unlockId": "unlock_id"
}
```

### GET `/api/rewards/current-tier`

Get user's current tier and progress.

**Returns**:
```json
{
  "currentTier": {...},
  "nextTier": {...},
  "userPoints": 1500,
  "progressPercentage": 12.5,
  "pointsToNext": 3500,
  "unlockedTiers": [...],
  "allTiers": [...]
}
```

---

## 🎯 Point Awarding System

### How to Award Points

Use the `awardPoints` utility:

```typescript
import { awardPoints } from '@/lib/rewards/award-points';

const result = await awardPoints(
  userId,
  100,  // points
  'Completed daily practice'  // reason
);

if (result.success) {
  console.log(`New total: ${result.newTotal}`);
}
```

### Automatic Tier Detection

The `awardPoints` function automatically:
1. Updates user's point balance
2. Checks for tier unlocks
3. Creates unlock records
4. Sends email notifications
5. Triggers celebration modal

### Integration Points

Award points when users:
- Complete achievements
- Finish training programs
- Log practice sessions
- Watch training videos
- Participate in tournaments
- Complete daily challenges

---

## 🎨 Customization

### Tier Configuration

Edit tiers in `scripts/seed-reward-tiers.ts`:

```typescript
{
  name: 'BRONZE',
  displayName: 'Bronze Champion',
  minPoints: 0,
  maxPoints: 999,
  tierLevel: 1,
  icon: '🥉',
  colorPrimary: '#CD7F32',
  colorSecondary: '#B87333',
  benefits: [...],
  sponsorSlot: 1
}
```

### Email Styling

Edit `lib/email/reward-tier-unlock-email.ts`:
- Colors
- Layout
- Copy
- CTA buttons

### Celebration Animation

Edit `app/components/tier-unlock-celebration.tsx`:
- Confetti count
- Animation duration
- Colors
- Effects

---

## 📊 Analytics & Tracking

### Tracked Metrics

- Tier unlock events
- Points earned by source
- Email open rates (via Resend)
- Celebration modal views
- Redemption patterns by tier

### Database Queries

```sql
-- Users by tier
SELECT 
  CASE 
    WHEN "rewardPoints" < 1000 THEN 'Bronze'
    WHEN "rewardPoints" < 5000 THEN 'Silver'
    ELSE 'Gold'
  END as tier,
  COUNT(*) as user_count
FROM "User"
GROUP BY tier;

-- Recent tier unlocks
SELECT 
  tu.*,
  rt."displayName",
  u.email
FROM "TierUnlock" tu
JOIN "RewardTier" rt ON tu."tierId" = rt.id
JOIN "User" u ON tu."userId" = u.id
ORDER BY tu."unlockedAt" DESC
LIMIT 10;
```

---

## 🧪 Testing Checklist

### Functional Tests

- [ ] User can view rewards center
- [ ] Current tier displays correctly
- [ ] Points balance is accurate
- [ ] Progress bar updates
- [ ] Tier cards show correct lock states
- [ ] Featured offers display
- [ ] Point awarding works
- [ ] Tier unlock detection triggers
- [ ] Email notification sends
- [ ] Celebration modal appears
- [ ] Confetti animation plays
- [ ] Redirection to marketplace works

### Edge Cases

- [ ] User at 0 points (before Bronze)
- [ ] User crosses multiple tiers at once
- [ ] User at max tier (Gold)
- [ ] Duplicate unlock prevention
- [ ] Email failure handling
- [ ] Modal dismiss behavior

### Performance

- [ ] Page loads under 3s
- [ ] Animations are smooth (60fps)
- [ ] API responses under 500ms
- [ ] Email sends asynchronously
- [ ] No blocking operations

---

## 🚨 Common Issues & Solutions

### Issue: Tier not unlocking

**Solution**: Check if user has sufficient points:
```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: { rewardPoints: true }
});
console.log('User points:', user.rewardPoints);
```

### Issue: Email not sending

**Solution**: Check Resend API key in `.env`:
```bash
RESEND_API_KEY=your_key_here
```

### Issue: Celebration modal not showing

**Solution**: Check `celebrationShown` flag:
```typescript
const unlock = await prisma.tierUnlock.findFirst({
  where: { 
    userId,
    celebrationShown: false 
  }
});
```

### Issue: Points not updating

**Solution**: Use transaction-safe update:
```typescript
await prisma.user.update({
  where: { id: userId },
  data: { rewardPoints: { increment: points } }
});
```

---

## 🔐 Security Considerations

1. **Authentication**: All API routes check session
2. **Authorization**: Users can only view/redeem their own rewards
3. **Input Validation**: Points must be positive integers
4. **Rate Limiting**: Prevent point farming
5. **Email Privacy**: Never expose email in public responses

---

## 📈 Future Enhancements

### Potential Features

1. **Tier Leaderboards**: Show top users per tier
2. **Tier Badges**: Visual badges on profile
3. **Tier Perks**: Exclusive features per tier
4. **Point History**: Detailed point transaction log
5. **Referral Bonuses**: Earn points for referrals
6. **Seasonal Tiers**: Limited-time special tiers
7. **Team Tiers**: Collaborative tier progression
8. **Tier Milestones**: Celebrate every 1000 points

### Sponsor Integration

1. **Tier-Specific Offers**: Link offers to tiers
2. **Sponsor Spotlights**: Featured sponsor per tier
3. **Exclusive Partnerships**: Gold-tier only sponsors
4. **Dynamic Pricing**: Tier-based discounts

---

## 📝 Maintenance

### Regular Tasks

- Monitor tier distribution
- Review point inflation
- Update tier thresholds if needed
- Refresh sponsor offers
- Analyze redemption patterns
- Optimize email templates

### Database Maintenance

```sql
-- Clean up old unlocks (if needed)
DELETE FROM "TierUnlock" 
WHERE "unlockedAt" < NOW() - INTERVAL '1 year';

-- Update tier stats
UPDATE "RewardTier" rt
SET "updatedAt" = NOW();
```

---

## 🎉 Conclusion

The Rewards Center is now fully implemented with:
- ✅ 3-tier system (Bronze/Silver/Gold)
- ✅ Automatic tier unlock detection
- ✅ Email notifications
- ✅ Apple-style celebration effects
- ✅ Comprehensive UI
- ✅ Points management system
- ✅ Sponsor integration ready

**Next Steps**:
1. Test the full flow with real users
2. Integrate with existing achievements
3. Add tier badges to user profiles
4. Set up sponsor partnerships
5. Monitor engagement metrics

**Questions or Issues?**
Refer to the API documentation or check the implementation files.

Happy coding! 🚀
